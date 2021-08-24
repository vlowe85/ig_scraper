# Instagram Followers Scraper

This is a minimalistic but real-life example of Instagram followers scraping using Node.js & MySQL

This script uses Instagram Cloud Proxy https://rapidapi.com/restyler/api/instagram40 and does not require your Instagram login or password to scrape followers.


# Installation

1. Git clone the repo & install dependencies

```
git clone https://github.com/restyler/ig_scraper.git
cd ig_scraper
npm i
cp .env.dist .env
```

2. Subscribe to https://rapidapi.com/restyler/api/instagram40 and put your api key to RAPIDAPI_KEY env variable (in .env file)

3. Create database in your MySQL and specify your DB credentials in .env file

4. Run MySQL migrations

```
npm run migrate
```


# Usage

## 1. Scrape followers
```
ACCOUNT=cristiano LIMIT=5000 IGNORE_FINISHED=1 node followers-step1.js
```
This will scrape 5000 followers of cristiano account to ig_profiles mysql table.
If you later decide you need more accounts scraped - you can proceed the job from the place it stopped, any time by changing `ACCOUNT=cristiano` to `JOB_ID=xxx` (where `JOB_ID` is the id of job for mysql `jobs` table)


## 2. Enrich followers with full profile data 
This will go through every public profile from step1 and will append data to each profile:
 1. followers count, 
 2. bio, 
 3. last 12 posts, 
 4. etc
```
JOB_ID=xx node followers-step2.js
```



