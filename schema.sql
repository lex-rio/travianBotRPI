create table users (
  userId    integer not null primary key,
  session   text    not null,
  chatId    text,
  --
  unique(userId),
  unique(session)
);

create table actions (
  actionId    integer not null primary key autoincrement,
  userId      integer not null references users,
  priority    integer not null DEFAULT 0,
  type        integer not null DEFAULT 0,
  villageId   integer,
  target      integer,
  time        integer,
  period      integer
);