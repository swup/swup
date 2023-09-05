import * as fs from 'fs';
export default class MarkdownReporter {
    constructor() {
        this.startTime = new Date();
        this.duration = -1;
        this.status = 'unknown';
        this.passed = [];
        this.failed = [];
        this.skipped = [];
        this.flaky = [];
        this.timedOut = [];
    }
    onBegin() {
        this.startTime = new Date();
    }
    onTestEnd(test, result) {
        const status = result.status;
        const outcome = test.outcome();
        const path = test.titlePath().filter(s => s.trim());
        const title = path.filter(s => !s.match(/\.(spec|test)\.(m|c)?(j|t)s$/i)).join(' → ');
        this[status].push(title);
        if (outcome === 'flaky') {
            this[outcome].push(title);
        }
    }
    // @ts-ignore: startTime and duration only available in Playwright >= 1.38/1.39
    onEnd(result, startTime, duration) {
        this.startTime = startTime !== null && startTime !== void 0 ? startTime : this.startTime;
        this.duration = duration !== null && duration !== void 0 ? duration : (Date.now() - this.startTime.getTime());
        this.status = result.status;
        // remove duplicate tests from passed array
        this.passed = this.passed.filter((element, index) => this.passed.indexOf(element) === index);
        // remove flaky or duplicate tests from the failed array
        this.failed = this.failed.filter((element) => !this.passed.includes(element));
        this.failed = this.failed.filter((element) => !this.flaky.includes(element));
        this.failed = this.failed.filter((element, index) => this.failed.indexOf(element) === index);
        const summary = new MarkdownReportSummary(this);
        fs.writeFileSync('./playwright-report/report.md', summary.generate());
    }
}
class MarkdownReportSummary {
    constructor(report) {
        this.report = report;
    }
    header() {
        return `## Playwright test results`;
    }
    summary() {
        const { passed, failed, skipped, flaky, duration } = this.report;
        const stats = [
            failed.length ? `![failed](https://icongr.am/octicons/stop.svg?size=14&color=da3633)  **${failed.length} failed**` : ``,
            passed.length ? `![passed](https://icongr.am/octicons/check-circle.svg?size=14&color=3fb950)  **${passed.length} passed**  ` : ``,
            flaky.length ? `![flaky](https://icongr.am/octicons/alert.svg?size=14&color=d29922)  **${flaky.length} flaky**  ` : ``,
            skipped.length ? `![skipped](https://icongr.am/octicons/skip.svg?size=14&color=abb4bf)  **${skipped.length} skipped**` : ``,
            `![duration](https://icongr.am/octicons/clock.svg?size=14&color=abb4bf)  ${formatDuration(duration)}`
        ];
        return stats.filter(Boolean).join('  \n');
    }
    details() {
        const details = [];
        ['failed', 'flaky', 'skipped'].forEach((status) => {
            const tests = this.report[status];
            if (!tests.length)
                return;
            details.push(`
        <details>
          <summary><strong>${upperCaseFirst(status)} tests</strong></summary>
          <ul>${tests.map((title) => `<li>${title}</li>`).join('\n')}</ul>
        </details>
      `.trim());
        });
        return details.join('\n');
    }
    generate() {
        const output = [
            this.header().trim(),
            this.summary().trim(),
            this.details().trim()
        ].join('\n\n');
        return stripLeadingWhitespace(output);
    }
}
function formatDuration(milliseconds) {
    const SECOND = 1000;
    const MINUTE = 60 * SECOND;
    const HOUR = 60 * MINUTE;
    const DAY = 24 * HOUR;
    let remaining = milliseconds;
    const days = Math.floor(remaining / DAY);
    remaining %= DAY;
    const hours = Math.floor(remaining / HOUR);
    remaining %= HOUR;
    const minutes = Math.floor(remaining / MINUTE);
    remaining %= MINUTE;
    const seconds = +(remaining / SECOND).toFixed(1);
    return [
        days && `${days} day${days !== 1 ? 's' : ''}`,
        hours && `${hours} hour${hours !== 1 ? 's' : ''}`,
        minutes && `${minutes} minute${minutes !== 1 ? 's' : ''}`,
        seconds && `${seconds} second${seconds !== 1 ? 's' : ''}`,
    ].filter(Boolean).join(', ');
}
function stripLeadingWhitespace(str) {
    return str.trim().replace(/(\n)([^\S\r\n]+)(\S)/g, '$1$3');
}
function upperCaseFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
