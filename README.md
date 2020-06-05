# MMM-Nirvana
Modul for [MagicMirror2](https://magicmirror.builders).  
Used for showing tasks from [Nirvana GTD](https://www.nirvanahq.com/)

## Configuration
``` 
{
  module:'MMM-Nirvana',
  position:"top_left",
  config:{
    username:'UsernameForNirvana',
    password:'MD5Hash_Of_Password',
    numberOfTasks:5,
    tag:null, //Set to filter by tag
    project:null //Set to filter by project name
    state:null //Set to filter by task status
    /* Possible states are  
        INBOX: 0,
        NEXT: 1,
        WAITING: 2,
        SCHEDULED: 3,
        SOMEDAY: 4,
        LATER: 5,
        TRASHED: 6,
        LOGGED: 7,
        DELETED: 8,
        RECURRING: 9,
        ACTIVE_PROJECT: 11*/
}
```


Use together with [MMM-ModuleScheduler](https://github.com/ianperrin/MMM-ModuleScheduler) to setup schedule for updating task list. Example
```
 {
      module: 'MMM-ModuleScheduler',
      config: {
        notification_schedule: [
          { notification: 'UPDATE_NIRVANA', schedule: '* * * * *', payload: {} }
        ]
      }
    },
  ```
