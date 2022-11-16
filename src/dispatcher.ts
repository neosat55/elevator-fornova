import {Logger} from '../lib/logger';
import {Elevator} from './elevator';
import {ExternalRequest} from './requests';
import {Direction} from './ifaces';
import {Passenger} from './passenger';

export class Dispatcher {
  private logger = new Logger(Dispatcher.name);
  private elevators: Elevator[];

  setElevators(value: Elevator[]) {
    this.elevators = value;
  }

  private pickBestElevator(request: ExternalRequest): Elevator {
    let bestFit: number | null = null;
    // random elevator is closest for now
    let closest = Math.floor(Math.random() * this.elevators.length);

    this.elevators.forEach((elevator, elIdx) => {
      const elevatorLevel = elevator.currentFloorLevel();
      const sourceFloor = request.floorNode.data.level;

      const approachingPassenger = (
        (elevator.direction === 'UP' && elevatorLevel <= sourceFloor) ||
        (elevator.direction === 'DOWN' && elevatorLevel >= sourceFloor) ||
        (elevator.state === 'IDLE')
      );

      const sameDirection = elevator.direction === request.direction || elevator.state === 'IDLE';
      const distance = Math.abs(sourceFloor - elevatorLevel);

      if (
        elevator.isEmpty() &&
        approachingPassenger &&
        sameDirection &&
        (bestFit === null || distance < Math.abs(sourceFloor - this.elevators[bestFit].currentFloorLevel()))
      ) {
        bestFit = elIdx;
      }
    });

    return this.elevators[bestFit ?? closest];
  }

  callElevator(direction: Direction, passenger: Passenger) {
    let request = new ExternalRequest(direction, passenger.currentFloor);
    const elevator = this.pickBestElevator(request);

    elevator.command('EXTERNAL', passenger.currentFloor, direction);

    elevator.on('can_enter', () => {
      elevator.passengerEnter(passenger);
    });

    elevator.on('can_exit', () => {
      passenger.exit(elevator);
    })
  }
}
