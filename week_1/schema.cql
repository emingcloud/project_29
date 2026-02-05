create KEYSPACE dev
 with replication = {
    'class': 'NetworkTopologyStrategy',
    'replication_factor': 1
}
and tablets = {
    'enabled': true
}; 

create table if not exists dev.users (
    user_id uuid,
    email text,
    username text,
    password text,
    preferences vector <float, 1024>,
    primary key (user_id)
);


create custom index if not exists preferences_idx
on dev.users(preferences)
using 'vector_index'
with options = {'similarity_function': 'DOT_PRODUCT'};


create table if not exists dev.user_by_email (
    user_id uuid,
    email text,
    password text,
    role text,
    primary key (email)
);
create table if not exists dev.movies (
    movie_id uuid,
    title text,
    plot text,
    genres set<text>,
    actors set<text>,
    release_year int,
    rating text,
    embedding vector<float, 1024>,
    primary key (movie_id)
);


create table if not exists dev.genres (
    genre_id uuid,
    genre text,
    primary key (genre_id)
);

create table if not exists dev.movies_by_genre (
    genre_id uuid,
    movie_id uuid,
    primary key (genre_id, movie_id)
);

create custom index if not exists embedding_idx
on dev.movies(embedding)
using 'vector_index'
with options = {'similarity_function': 'DOT_PRODUCT'};