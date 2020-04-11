# Kolan

Kolan is a self-hostable project management website, that is built around the concept of Kanban boards. You create tasks that you move to different columns as you progress. The default columns are "Backlog", "Ready", "In Progress" and "Done", but you can of course choose these yourself. Tasks contain a title, description, tag and assignee. The description can be written in markdown, and tags make sure all tasks with the same tag share the same colour. If you have bigger tasks with more steps, you can create another kanban board inside that task. This is what makes Kolan recursive. You can also share a board with other users, and work together on it in real-time, for example like on Google Docs.  

[Read-only demo](https://kolan.smrk.me/Board/WDRGEzAw4)

![Preview](https://i.imgur.com/fGNKBaE.png)

## Features
* Create Kanban boards with your own set of columns/milestones.
* Simple and modern UI
* Collaborate with other users on the same board in real-time.
* Assign different tasks to different users.
* Create boards inside tasks, to more easily organise and plan larger tasks.
* Both a light theme and a dark theme, with the possibility of creating your own themes if you know CSS and host your own instnace.
* Fairly good support for small devices (eg. phones, tablets). However, you cannot move tasks around on these.
* Open source and easy to self-host.

## Setting up
### Dependencies:
* dotnet core - 3.1
* neo4j (with the APOC procedures plugin) - 3.5

### Note
You will need to append the following line to `neo4j.conf`: `cypher.lenient_create_relationship=true`

### Process
Clone this repository and `cd` into it with a terminal. Write `./node_module/gulp/bin/gulp.js produce` to the frontend up. After that, copy `server-config.example.json` as `server-config.json` and edit it to fit your needs. Then, `cd` into the `Kolan` folder that lies right in the repository root and compile and run the dotnet core backend. These instructions are a bit vague at the moment, since Kolan is not ready for production yet. Later on, there will likely be some sort of docker image or docker-compose file.
