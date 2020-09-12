create table users (
  id      integer not null primary key,
  session text    not null,
  chatId  text    not null,
  name    text,
  --
  unique(id)
);

create table villages (
  id      integer not null primary key,
  userId  integer not null references users,
  listId  integer not null,
  name    text    not null,
  --
  unique(id)
);

create table actions (
  id          integer not null primary key autoincrement,
  userId      integer not null references users,
  priority    integer not null DEFAULT 0,
  type        integer not null DEFAULT 0,
  villageId   integer,
  target      integer,
  time        integer,
  period      integer
);