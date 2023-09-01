import * as fs from 'fs';

import {
  TestCase,
  TestResult,
  Reporter,
  FullResult,
} from '@playwright/test/reporter';

export interface Report {
  duration: number;
  status: FullResult['status'] | 'unknown' | 'skipped';
  passed: string[];
  failed: string[];
  skipped: string[];
  flaky: string[];
  timedOut: string[];
}

class GitHubCommentReporter implements Reporter, Report {
  startedAt = 0;
  duration = -1;
  status: Report['status'] = 'unknown';
  passed: string[] = [];
  failed: string[] = [];
  skipped: string[] = [];
  flaky: string[] = [];
  timedOut: string[] = [];

  onBegin() {
    this.startedAt = Date.now();
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const status = result.status;
    const outcome = test.outcome();
    const title = test.titlePath().filter(s => s.trim()).join(' > ');
    this[status].push(title);
    if (outcome === 'flaky') {
      this[outcome].push(title);
    }
  }

  onEnd(result: FullResult) {
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
  report: Report;
  constructor(report: Report) {
    this.report = report;
  }
  header() {
    return `## :performing_arts:  Playwright test run ${this.report.status}`;
  }
  summary() {
    const { passed, failed, skipped, flaky, duration } = this.report;
    const stats = [
      failed.length ? `:red_circle:  ${failed.length} failed` : ``,
      passed.length ? `:green_circle:  ${passed.length} passed` : ``,
      flaky.length ? `:orange_circle:  ${flaky.length} flaky` : ``,
      skipped.length ? `:yellow_circle:  ${skipped.length} skipped` : ``,
      `:hourglass:  ${formatDuration(duration)}`
    ];
    return stats.filter(Boolean).join('  \n');
  }
  details() {
    const details: string[] = [];
    ['failed', 'skipped', 'flaky'].forEach((status) => {
      const tests: string[] = this.report[status];
      if (!tests.length) return;
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

function formatDuration(milliseconds: number): string {
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

function stripLeadingWhitespace(str: string): string {
  return str.trim().replace(/(\n)([^\S\r\n]+)(\S)/g, '$1$3');
}

function upperCaseFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default GitHubCommentReporter;
