# Try it out
https://nc-news-egcd.onrender.com/api/

# Getting Started

### Requirements
- [Postgres](https://www.postgresql.org/)
- [Node.js](https://nodejs.org/)

Tested with psql 15.4 and node 21.1.0.

### Clone repository
```
git clone https://github.com/sw212/nc-news.git
```

### Install required packages
```
npm i
```



### For testing
Create a `.env.test` file in the root of this repository with the following
```
PGDATABASE=nc_news_test
```

### For development
Create a `.env.development` file in the root of this repository with the following
```
PGDATABASE=nc_news
```

### Setup & seed DB
```
npm run setup-dbs
npm run seed
```

### Start local server
```
npm run start
```

### Explore
Navigate to http://localhost:3000/api for an API overview.
