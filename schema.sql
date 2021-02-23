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
  type        integer not null DEFAULT 0,
  period      integer,
  params      text
);