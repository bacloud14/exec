# Exec


### Welcome to Code execution report. A light service to track the execution of your code (use only for development and experiment).

The project is in the developement stage and is not useful at the moment.

A session is defined to fit few executions together, if you are working on different subjects, for example: 

- Approximate the mean of stream data for a one day window
- Regression model results
- Simulations
- Basically any bake and wait algorithm that takes minutes to hours to a few days.

An execution is a code block to track, It can be one of the following states: Running, Passive, Exec crushed, Execution crushed

- Running: When code is still looking for a solution
- Passive: When code is did not start, or started and successfully finished executing.
- Exec crushed: When this service "Exec" crushed, the execution exited in a non manageable exception or the service bugged.
- Execution crushed: When the tracked code block did not succeed in providing the rest waited, but exited in a manageable exception. 

The final aim is to get a report after a code block finishes execution in a web service host on the cloud. 

### Security: 

An important consideration, is that I try to secure the service without any form of authentication. Access to resources is open through API with obfuscated URLs, and all resources are claimed after 14 days the last execution for the current user session started running. On server no logging of any user information is there. The only exceptions are:

- IP is tracked to block excessive requests for a window of 1 hour. 
- A client-server session is assured through a client cookie and has a time to live for 14 days after the last execution started running.

#### To-do in Security:

One day key client-server claim, used to change API POST encrypt endpoints (session/create/ , execution/create/ ...).

In progress:
All work is in development stage, this repository is the web service and not complete. Also, different clients are being built: Python, Go, 

### Hosting:
The service is accessible through http://130.61.120.197/ to be less memorable.

### Contact:
bacloud[fourteen][at]gmail.com

