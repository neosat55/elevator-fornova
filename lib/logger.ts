import * as chalk from 'chalk';

const hexColors = [
  '#3eb489',
  '#e6e6fa',
  '#c8dfba',
  '#d6e7cb',
  '#dccbe7',
  '#12aca3',
  '#848e00',
  '#609960',
  '#6fbf8a',
  '#8eb6f5',
  '#d1918f',
  '#a392dc',
  '#a0b6e8',
  '#94b8ff',
  '#eb4b4b',
  '#2f5704',
  '#0a4859',
  '#1590b2',
  '#ccb6a3',
  '#927158',
  '#7a5524',
  '#fac676',
  '#e8a75a',
  '#574037',
  '#fde4bc',
  '#8fde32',
  '#8b7d99',
  '#eebbee',
  '#56887d',
  '#ee2c2c',
  '#ff7f00',
  '#ff55a3',
  '#7997af',
  '#580080',
  '#9b00ff',
  '#ff9b00',
  '#009bff',
  '#8463f6',
  '#4a7c9f',
  '#6bb2e4',
  '#97a1aa',
  '#191970',
];

export class Logger {
  private beautyName: string;

  constructor(private name: string, private id?: number) {
    this.beautyName = `${this.name}#${this.id}`;

    if (this.id) {
      this.beautyName = this.colored()(this.beautyName);
    }
  }

  private get time() {
    return new Date().getTime();
  }

  private colored() {
    const randColor = Math.floor(Math.random() * hexColors.length);

    return chalk.hex(hexColors[randColor]);
  }

  log(msg: string) {
    if (process.env.DEBUG !== 'development') {
      return;
    }

    console.log(`[${this.time}][${this.beautyName}] ${msg}`);
  }
}
