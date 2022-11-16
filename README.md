# Elevator simulator

We have a building with N elevators. A passenger calls an elevator in a certain floor and, we need to know which elevator would stop for that passenger. 
We should consider a few parameters such as proximity to the passenger, current elevator direction, status (idle or
moving up/down) etc. 
It’s up to you to decide which parameters are considered and prioritized, as long as you can explain your logic, please also provide a way to set the initialize parameters for the app such as adding new passenger settings elevator
status etc..., you can add an example either through unit testing or by UI framework you like (in case you are applying for full stack/frontend positions).

Please note that the target floor is requested from the hall, not from within the elevator, like in many modern large buildings.

**Bonus**: Add functionality which can initialize with all elevators as empty on the
ground floor. Then we randomly add a passenger at random floor with random
destination. it should trigger every 5 seconds and will display the final status of
all elevators
