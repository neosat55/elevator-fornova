import {Dispatcher} from './dispatcher';
import {Floor} from './floor';
import {Passenger} from './passenger';
import {Elevator} from './elevator';
import {DoubleLinkedList, Node} from '../lib/doubleLinkedList';

interface IPassengerLife {
  playAfter: number,
  passenger: Passenger,
  wantTo: Node<Floor>
}

interface ISimulatorConfig {
  floorsN: number,
  elevatorsN: number,
  passengersN: number,
  maxPassengers: number,
  time: {
    min: number,
    max: number,
  },
}

class Simulator {
  private readonly floors: DoubleLinkedList<Floor>;
  private readonly elevators: Elevator[];
  private readonly passengers: IPassengerLife[];
  private readonly dispatcher: Dispatcher;
  private readonly config: ISimulatorConfig;

  constructor(config: Partial<ISimulatorConfig> = {}) {
    this.dispatcher = new Dispatcher();

    this.config = this.normalizeConfig(config);
    this.floors = this.createFloors(this.dispatcher, this.config.floorsN);
    this.elevators = this.createElevators(this.config.elevatorsN, this.floorAt(1));
    this.passengers = this.createPassengers(this.config.passengersN);

    this.dispatcher.setElevators(this.elevators);
  }

  run() {
    this.passengers.forEach((life) => {
      this.playAfterTime(() => life.passenger.pressFloorButton(life.wantTo), life.playAfter);
    });
  }

  printStat() {
    this.elevators.forEach((el) => {
      console.log(`
        Elevator#${el.id} 
          - floor: ${el.currentFloor.data.level}
          - state: ${el.state}
          - direction: ${el.direction}
      `);
    });
  }

  private createFloors(dispatcher: Dispatcher, n: number): DoubleLinkedList<Floor> {
    const floorsList = new DoubleLinkedList<Floor>();

    for (let i = 1; i <= n; i++) {
      floorsList.append(new Floor(dispatcher, i));
    }

    return floorsList;
  };

  private createElevators(n: number, hall: Node<Floor>) {
    const elevators = [];

    for (let i = 1; i <= n; i++) {
      elevators.push(new Elevator({
        id: i,
        currentFloor: hall,
        state: 'IDLE',
        maxPassengers: this.config.maxPassengers,
      }));
    }

    return elevators;
  };

  private createPassengers(n: number): IPassengerLife[] {
    const passengers: IPassengerLife[] = [];

    for (let i = 1; i <= n; i++) {
      const source = this.randFloor();
      let dest = this.randFloor();

      if (source.data.level === dest.data.level) {
        dest = this.randFloor();
      }

      passengers.push({
        playAfter: this.getRandomArbitrary(this.config.time.min, this.config.time.max),
        passenger: new Passenger(i, source),
        wantTo: dest,
      });
    }

    return passengers;
  }

  private floorAt(n: number): Node<Floor> {
    return this.floors.find((f) => f.level === n)!;
  }

  private randFloor(): Node<Floor> {
    const rnd = this.getRandomArbitrary(1, this.config.floorsN);

    return this.floorAt(rnd);
  }

  private getRandomArbitrary(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min);
  }

  private playAfterTime(cb: () => void, time: number) {
    setTimeout(cb, time);
  }

  private normalizeConfig(config: Partial<ISimulatorConfig>): ISimulatorConfig {
    return {
      elevatorsN: config.elevatorsN || 5,
      floorsN: config.floorsN || 20,
      passengersN: config.passengersN || 50,
      maxPassengers: config.maxPassengers || 5,
      time: {
        min: 800,
        max: 5000,
      },
    };
  }
}

const main = () => {
  const sim = new Simulator({
    elevatorsN: 2,
    floorsN: 10,
    passengersN: 5,
  });

  sim.run();

  setInterval(() => {
    sim.printStat();
  }, 5000);
};

main();
