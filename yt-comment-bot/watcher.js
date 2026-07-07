import fs from "node:fs/promises";
import path from "node:path";
import { google } from "googleapis";
import { authenticate } from "@google-cloud/local-auth";

const SCOPES = ["https://www.googleapis.com/auth/youtube.force-ssl"];

const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const POSTED_PATH = path.join(process.cwd(), "posted.json");
const COMMENTS_PATH = path.join(process.cwd(), "comments.json");

const CHECK_EVERY_MS = 5 * 60 * 1000;
const MAX_RESULTS = 1;


async function loadJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

async function saveJson(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

async function loadCredentialsData() {
  if (process.env.CREDENTIALS_JSON) {
    return JSON.parse(process.env.CREDENTIALS_JSON);
  }

  const credentialsContent = await fs.readFile(CREDENTIALS_PATH, "utf8");
  return JSON.parse(credentialsContent);
}

async function loadSavedCredentials() {
  try {
    const credentials = await loadCredentialsData();
    const key = credentials.installed || credentials.web;

    const oauth2Client = new google.auth.OAuth2(
      key.client_id,
      key.client_secret,
      key.redirect_uris?.[0] || "http://localhost"
    );

    let token;

    if (process.env.TOKEN_JSON) {
      token = JSON.parse(process.env.TOKEN_JSON);
    } else {
      const tokenContent = await fs.readFile(TOKEN_PATH, "utf8");
      token = JSON.parse(tokenContent);
    }

    oauth2Client.setCredentials({
      refresh_token: token.refresh_token
    });

    await oauth2Client.getAccessToken();

    return oauth2Client;
  } catch (error) {
    console.log("⚠️ Не вдалося завантажити OAuth дані:", error.message);
    return null;
  }
}

async function saveCredentials(client) {
  if (process.env.RENDER) return;

  const keys = await loadCredentialsData();
  const key = keys.installed || keys.web;

  const payload = {
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token
  };

  await saveJson(TOKEN_PATH, payload);
}

async function authorize() {
  let client = await loadSavedCredentials();

  if (client) {
    return client;
  }

  if (process.env.RENDER) {
    throw new Error(
      "На Render немає TOKEN_JSON або CREDENTIALS_JSON. Додай їх в Environment."
    );
  }

  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH
  });

  await saveCredentials(client);

  client = await loadSavedCredentials();

  if (!client) {
    throw new Error("Не вдалося створити OAuth client після авторизації.");
  }

  return client;
}

function pickRandomComment(comments) {
  return comments[Math.floor(Math.random() * comments.length)];
}

const CHANNEL_ID = "UCFfKrEzbnX7smKtF6w3P4lw";


async function getUploadsPlaylistId(youtube) {
  const res = await youtube.channels.list({
    part: ["contentDetails"],
    id: [CHANNEL_ID]
  });

  const channel = res.data.items?.[0];

  if (!channel) {
    throw new Error("Не знайшов канал по CHANNEL_ID.");
  }

  return channel.contentDetails.relatedPlaylists.uploads;
}

async function getLatestVideos(youtube, uploadsPlaylistId) {
  const res = await youtube.playlistItems.list({
    part: ["snippet"],
    playlistId: uploadsPlaylistId,
    maxResults: MAX_RESULTS
  });

  return (res.data.items || [])
    .map((item) => ({
      videoId: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      publishedAt: item.snippet.publishedAt
    }))
    .filter((item) => item.videoId);
}

async function postComment(auth, videoId, text) {
  await auth.getAccessToken();

  const youtube = google.youtube({
    version: "v3",
    auth
  });

  const res = await youtube.commentThreads.insert({
    part: ["snippet"],
    requestBody: {
      snippet: {
        videoId,
        topLevelComment: {
          snippet: {
            textOriginal: text
          }
        }
      }
    }
  });

  return res.data.id;
}

async function checkAndComment() {
  const auth = await authorize();

  const youtube = google.youtube({ version: "v3", auth });

  const comments = await loadJson(COMMENTS_PATH, []);
  const posted = await loadJson(POSTED_PATH, {});

  if (!comments.length) {
    console.log("❌ У comments.json немає коментарів.");
    return;
  }

  const uploadsPlaylistId = await getUploadsPlaylistId(youtube);
  const videos = await getLatestVideos(youtube, uploadsPlaylistId); 

  console.log(`🔎 Знайдено відео: ${videos.length}`);

  for (const video of videos) {
    if (posted[video.videoId]) {
      console.log(`⏭️ Уже коментував: ${video.title}`);
      continue;
    }

    const comment = pickRandomComment(comments);

    try {
      console.log(`💬 Додаю коментар: ${video.title}`);

      const commentId = await postComment(auth, video.videoId, comment);

      posted[video.videoId] = {
        title: video.title,
        commentId,
        comment,
        date: new Date().toISOString()
      };

      await saveJson(POSTED_PATH, posted);

      console.log(`✅ Коментар додано: ${video.title}`);
    } catch (error) {
      console.log(`❌ Помилка для відео: ${video.title}`);
      console.log(error.response?.data || error.message);
    }
  }
}

async function main() {
  const once = process.argv.includes("--once");

  await checkAndComment();

  if (once) return;

  console.log("👀 Watcher запущено. Перевірка кожні 5 хвилин.");

  setInterval(async () => {
    try {
      await checkAndComment();
    } catch (error) {
      console.log("❌ Помилка watcher:");
      console.log(error.response?.data || error.message);
    }
  }, CHECK_EVERY_MS);
}

main(); 