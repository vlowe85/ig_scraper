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

All the data is put to `ig_profiles` mysql table, e.g. full profile JSON blob is put to `anonData` column.

## 3. SQL to show profiles with amount of followers > 500 and alive ((second recent post likes + comments) > 150 AND second recent post creation date is less than 200 days):
replace `jobId=1` with your jobId
```sql
select concat("https://instagram.com/", b.username) as link, external_url, isBusiness, followerCount, email, username, fullName, bio, post_count, second_post_likes, second_post_comments, second_post_days_ago from (select ig_profiles.*,anonData->"$.biography" as bio, anonData->>"$.external_url" as external_url, 
anonData->>"$.edge_owner_to_timeline_media.count" as post_count,  
anonData->>"$.edge_owner_to_timeline_media.edges[1].node.edge_liked_by.count" as second_post_likes,
anonData->>"$.edge_owner_to_timeline_media.edges[1].node.edge_media_to_comment.count" as second_post_comments,
FROM_UNIXTIME(anonData->>"$.edge_owner_to_timeline_media.edges[1].node.taken_at_timestamp") as second_post_time,

ROUND((UNIX_TIMESTAMP() - anonData->>"$.edge_owner_to_timeline_media.edges[1].node.taken_at_timestamp")/(60*60*24)) as second_post_days_ago
from ig_profiles where jobId=1 ) b where followerCount > 500
and (second_post_likes+second_post_comments)>150
and second_post_days_ago<200 order by followerCount desc
```

