import * as fs from 'fs';
class GitHubCommentReporter {
    constructor() {
        this.startedAt = 0;
        this.duration = -1;
        this.status = 'unknown';
        this.passed = [];
        this.failed = [];
        this.skipped = [];
        this.flaky = [];
        this.timedOut = [];
    }
    onBegin() {
        this.startedAt = Date.now();
    }
    onTestEnd(test, result) {
        const status = result.status;
        const outcome = test.outcome();
        const title = test.titlePath().filter(s => s.trim()).join(' > ');
        this[status].push(title);
        if (outcome === 'flaky') {
            this[outcome].push(title);
        }
    }
    onEnd(result) {
        this.duration = Date.now() - this.startedAt;
        this.status = result.status;
        // remove duplicate tests from passed array
        this.passed = this.passed.filter((element, index) => this.passed.indexOf(element) === index);
        // remove flaky or duplicate tests from the failed array
        this.failed = this.failed.filter((element) => !this.passed.includes(element));
        this.failed = this.failed.filter((element) => !this.flaky.includes(element));
        this.failed = this.failed.filter((element, index) => this.failed.indexOf(element) === index);
        const comment = new GitHubReportComment(this);
        fs.writeFileSync('./playwright-report.md', comment.generate());
    }
}
class GitHubReportComment {
    constructor(report) {
        this.report = report;
    }
    header() {
        return `## :performing_arts:  Playwright test run ${this.report.status}`;
    }
    summary() {
        const { passed, failed, skipped, flaky, duration } = this.report;
        const stats = [
            failed.length ? `:red_circle:  ${failed.length} failed` : ``,
            passed.length ? `:green_circle:  ${passed.length} passed` : ``,
            flaky.length ? `:orange_circle:  ${flaky.length} flaky` : ``,
            skipped.length ? `:yellow_circle:  ${skipped.length} skipped` : ``,
            `:hourglass:  ${formatDuration(duration)}`
        ];
        return stats.filter(Boolean).join('  \n');
    }
    details() {
        const details = [];
        ['failed', 'skipped', 'flaky'].forEach((status) => {
            const tests = this.report[status];
            if (!tests.length)
                return;
            details.push(`
        <details>
          <summary>${upperCaseFirst(status)} tests</summary>
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
export default GitHubCommentReporter;
