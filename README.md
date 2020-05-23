# Exec


### Welcome to Code execution report. A light service to track the execution of your code (use only for development and experiment).

#### DISCLAIMER

The whole idea of this project is to exercise a loose form of authentication and usage of a web service, yet trying to produce it in the most secure way possible. The use case itself is not really useful knowing available services online.
The project is in the developement stage and not secure enough even for what it claims.

A session is defined to fit some number of executions together. This way you can define sessions for different time slots (work for two days on a single subject) or for different subjects for example: 

- Regression model results
- Simulations
- Basically any bake and wait algorithm that takes minutes to hours to a few days.

Executions of the regression model results could be:

- Approximate the mean of stream data for a one day window
- Running statistics, or learning algorithm and caulculate scores and predictions.

An execution is a code block to track, It can be one of the following states: Running, Passive, Exec crushed, Execution crushed

- Running: When code is still looking for a solution
- Passive: When code did not start, or started and successfully finished executing.
- Exec crushed: When the service "Exec" crushed, the execution exited in a non manageable exception or the service bugged.
- Execution crushed: When the tracked code block did not succeed in providing the rest waited, but exited in a manageable exception. 

The final aim is to get a report after a code block finishes execution in a web service hosted on the cloud. 

### Data model:
The data model simply replicates the previous assumptions. Through a kind of Snowflake model, specifically a cascading one to many relationships with some describing data.
[User] 1 --- * [Session] 1 --- * [Execution] 1 --- * [Report]

The data model as it seems is very easy to deal with. Another way to implement this data model is using document embedding approach: 
https://docs.mongodb.com/manual/tutorial/model-embedded-one-to-many-relationships-between-documents/
which is easier to interact; However this comes at the expense of performance; Because whenever you load a user, you load all sessions, executions and reports with it.

I found a compromise between a normalized model and the one using embedded documents; Described here:
<img src="./Exec data model.svg">

### Clients:

Clients should have as many clients as possible (per language)
Currently, we can simply test the service through a notebook: https://github.com/bacloud14/exec_client

### The web interface:

It would normally turn to basic dashboard counting code being run; Thus all create endpoints will be hidden.
The dashboard would contain: Numbers of active users, active sessions, running executions ...
Also it would include a documentation about the service and the clients.

### Security: 

An important consideration is that I try to secure the service without any form of authentication. Access to resources is open through API with obfuscated URLs, and all resources are cleaned after 14 days countring from the beginning of the last execution of the current user session. On server side, no logging of any user information is saved. The only exceptions are:

- IP is tracked to block excessive requests for a window of 1 hour. 
- A client-server session is assured through a client cookie and has a time to live for 14 days after the last execution started running.

#### To-do in Security:

One day key client-server claim, used to change API POST create endpoints (session/create/ , execution/create/ ...).

### In progress:

All work is in development stage, this repository is the web service and not complete. Also, different clients are being built: Python, Go, etc.
As said earlier, the data model is like: [User] 1 --- * [Session] 1 --- * [Execution] 1 --- * [Report] but for now, there is no report, all is information describing an execution is simply embeded in the execution document. A better way would be to separate a new entity: Report which can hold streaming execution reports (like logging, evolution of training score, etc.)
Reports are sent from client using Socket protocol, rather than Rest API like other create endpoints.

### Hosting:

The service is accessible through http://IP_address/ (is down for the moment). No domain name will be used in my opinio.

### Contact:

bacloud[fourteen][at]gmail.com

Credit
======
Both data model and project code initially taken and modified from :

    What: express-locallibrary-tutorial
    
    Source URL: https://github.com/mdn/express-locallibrary-tutorial
    
    Initiator: MDN Web Docs
    
    License: CC0-1.0
