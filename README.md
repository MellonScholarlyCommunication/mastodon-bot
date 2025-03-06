# mastodon-bot

A Mastodon bot for the UGent/SURF researcher profile project.

## Install

```
yarn install
```

## Configuration

```
cp .env-example .env
```

## Run the LDN Inbox server

```
yarn run server
```

## Fetch some toots into ./accepted/

```
yarn run fetch
```

## Clean all processed results

```
yarn run real-clean
```

## Demo

### Show handling of incoming toots

```
yarn real-clean
```

Add a demo incoming toot:

```
yarn demo-accepted
```

Run the handler for incoming toots:

```
yarn handle-accepted
```

### Show successful handling of metadata toots

```
yarn real-clean
```

We assume now that an outgoing Offer has been sent to a Zotero service node and it will send some metadata back for the toot:

```
yarn demo-metadata
```

Process the incoming metadata and update the Wiki

```
yarn handle-inbox
```

### Show failed handling of metadata toots

```
yarn real-clean
```

We assume now that an outgoing Offer has been sent to a Zotero service node and it will send some metadata back for the toot:

```
yarn demo-metadata-reject
```

Process the incoming metadata and update the Wiki

```
yarn handle-inbox
```

### Show summary of events 

Show the summary of what just happened:

```
$ yarn -s cache-admin summary
urn:uuid:6d21a2ae-df59-40d9-999c-18e19277d21a Announce
 from: https://mastodon.social/@patrickhochstenbach
 object: https://mastodon.social/@patrickhochstenbach/112891078566219289
 updated: Mon Sep 30 2024 08:47:17 GMT+0200 (Central European Summer Time)
```

Show the complete trace of the `urn:uuid:6d21a2ae-df59-40d9-999c-18e19277d21a` Announce:

```
$ yarn -s cache-admin summary urn:uuid:6d21a2ae-df59-40d9-999c-18e19277d21a
urn:uuid:6d21a2ae-df59-40d9-999c-18e19277d21a Announce
 from: https://mastodon.social/@patrickhochstenbach
 object: https://mastodon.social/@patrickhochstenbach/112891078566219289
 updated: Mon Sep 30 2024 08:47:17 GMT+0200 (Central European Summer Time)

  urn:uuid:87c82bf0-c632-4091-bd7c-9e76636eb028 View
   from: https://mycontributions.info/service/m/profile/card#me
   object: https://mastodon.social/@patrickhochstenbach
   updated: Mon Sep 30 2024 08:47:17 GMT+0200 (Central European Summer Time)
   original: urn:uuid:6d21a2ae-df59-40d9-999c-18e19277d21a

  urn:uuid:cad1dd05-6e73-4290-afd1-cdbc8aca3f1c View
   from: https://mycontributions.info/service/m/profile/card#me
   object: https://wiki.mycontributions.info/en/researcher/orcid/0000-0001-8390-6171
   updated: Mon Sep 30 2024 08:47:17 GMT+0200 (Central European Summer Time)
   original: urn:uuid:6d21a2ae-df59-40d9-999c-18e19277d21a

  urn:uuid:24a5bd9d-663b-44bb-b13f-85a91f767d5f Offer
   from: https://mycontributions.info/service/m/profile/card#me
   object: https://www.faz.net/aktuell/feuilleton/debatten/the-digital-debate/shoshan-zuboff-on-big-data-as-surveillance-capitalism-13152525.html
   updated: Mon Sep 30 2024 08:47:17 GMT+0200 (Central European Summer Time)
   original: urn:uuid:6d21a2ae-df59-40d9-999c-18e19277d21a

  urn:uuid:75806b42-41f5-46fb-8519-6e964c93c19e Offer
   from: https://mycontributions.info/service/m/profile/card#me
   object: https://journal.code4lib.org/articles/17823
   updated: Mon Sep 30 2024 08:48:28 GMT+0200 (Central European Summer Time)
   original: urn:uuid:6d21a2ae-df59-40d9-999c-18e19277d21a

  urn:uuid:ef99b36a-5896-46ee-b164-2da1467f6a35 Announce
   from: https://mycontributions.info/service/x/profile/card#me
   object: https://mycontributions.info/service/x/result/2024/08/14/9a3b6978a49f9aaf055181e5993c5d89.json
   updated: Mon Sep 30 2024 08:49:00 GMT+0200 (Central European Summer Time)
   original: urn:uuid:6d21a2ae-df59-40d9-999c-18e19277d21a

  urn:uuid:c6fa001c-8a5e-4c89-8c46-b8a37824cdfe Offer
   from: https://mycontributions.info/service/m/profile/card#me
   object: urn:uuid:c3e05e81-3bb0-45fd-bcfc-7e8cf1ad3e43
   updated: Mon Sep 30 2024 08:49:01 GMT+0200 (Central European Summer Time)
   original: urn:uuid:6d21a2ae-df59-40d9-999c-18e19277d21a

  urn:uuid:4c1e963f-fc68-45db-95c6-e6e2e4c15c7f Announce
   from: https://wiki.mycontributions.info/profile/card#me
   object: https://wiki.mycontributions.info/en/researcher/orcid/0000-0001-8390-6171
   updated: Mon Sep 30 2024 08:49:01 GMT+0200 (Central European Summer Time)
   original: urn:uuid:6d21a2ae-df59-40d9-999c-18e19277d21a

  urn:uuid:169cd8ce-e6a5-4bab-a94e-dcb61299e6ee Announce
   from: https://mycontributions.info/service/m/profile/card#me
   object: urn:uuid:ab20087b-7b35-49f4-a42e-f73b7916c0ce
   updated: Mon Sep 30 2024 08:49:01 GMT+0200 (Central European Summer Time)
   original: urn:uuid:6d21a2ae-df59-40d9-999c-18e19277d21a
```

## Docker

Build a version of a docker image:

```
docker build . -t hochstenbach/claimbot-server:v0.0.1
```

Run a docker image:

```
docker container run --env-file .env -p 3002:3002 --rm hochstenbach/claimbot-server:v0.0.1
```

Run only a shell

```
docker run --rm --env-file .env -v `pwd`/inbox:/app/inbox -it hochstenbach/claimbot-server:v0.0.1 sh
```

Push it to DockerHub:

```
docker push hochstenbach/metadata-server:v0.0.1
```