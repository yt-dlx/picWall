import dotenv from "dotenv";
import fetch from "node-fetch";
import { join, basename } from "path";
import { readFileSync, readdirSync, statSync } from "fs";
dotenv.config({ path: "../.env" });
const repo = "picWall";
const owner = "yt-dlx";
const defaultBaseBranch = "empty";
const commitMessage = "picWall™ AI";
const token = process.env.GITHUB_TOKEN;
const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
function getDirectories(basePath) {
  const directories = readdirSync(basePath)
    .map((folder) => join(basePath, folder))
    .filter((path) => statSync(path).isDirectory());
  console.log(`Found directories: ${directories.join(", ")}`);
  return directories;
}
const directories = getDirectories("./source/output");
async function fetchBranch(branch) {
  console.log(`Fetching branch: ${branch}`);
  const response = await fetch(`${apiUrl}/git/ref/heads/${branch}`, { headers: { Authorization: `token ${token}` } });
  if (response.ok) {
    const branchData = await response.json();
    console.log(`Branch ${branch} exists.`);
    return branchData;
  } else {
    console.log(`Branch ${branch} does not exist.`);
    return null;
  }
}
async function getRemoteFiles(branch) {
  const refData = await fetchBranch(branch);
  if (!refData) return new Set();
  const commitSha = refData.object.sha;
  const treeResponse = await fetch(`${apiUrl}/git/trees/${commitSha}?recursive=1`, { headers: { Authorization: `token ${token}` } });
  if (treeResponse.ok) {
    const treeData = await treeResponse.json();
    const files = treeData.tree.filter((item) => item.type === "blob").map((item) => item.path);
    console.log(`Fetched ${files.length} files from branch ${branch}.`);
    return new Set(files);
  } else {
    console.error(`Error fetching tree for branch ${branch}:`, await treeResponse.text());
    return new Set();
  }
}
async function deleteContent(path, branch) {
  const response = await fetch(`${apiUrl}/contents/${path}?ref=${branch}`, { headers: { Authorization: `token ${token}` } });
  if (response.ok) {
    const items = await response.json();
    if (Array.isArray(items)) {
      for (const item of items) await deleteContent(item.path, branch);
    } else {
      await fetch(`${apiUrl}/contents/${items.path}`, {
        method: "DELETE",
        body: JSON.stringify({ message: `Delete ${items.path}`, sha: items.sha, branch }),
        headers: { Authorization: `token ${token}`, "Content-Type": "application/json" }
      });
      console.log(`Deleted: ${items.path}`);
    }
  } else console.error(`Error fetching content at path ${path}:`, await response.text());
}
async function deleteFilesInBranch(branch) {
  console.log(`Deleting all content in branch: ${branch}`);
  await deleteContent("", branch);
  console.log(`All content in branch ${branch} deleted successfully.`);
}
async function createBranch(newBranch, sourceBranch = defaultBaseBranch) {
  console.log(`Creating branch: ${newBranch} from ${sourceBranch}`);
  const branchData = await fetchBranch(sourceBranch);
  if (branchData) {
    const sha = branchData.object.sha;
    const response = await fetch(`${apiUrl}/git/refs`, {
      method: "POST",
      body: JSON.stringify({ ref: `refs/heads/${newBranch}`, sha }),
      headers: { Authorization: `token ${token}`, "Content-Type": "application/json" }
    });
    if (response.ok) {
      console.log(`Branch ${newBranch} created successfully.`);
      await deleteFilesInBranch(newBranch);
    } else console.error(`Error creating branch ${newBranch}:`, await response.text());
  } else console.error(`Source branch ${sourceBranch} not found. Cannot create branch ${newBranch}.`);
}
async function uploadFileToGitHub(filePath, remotePath, branch) {
  console.log(`Uploading file: ${filePath} to ${remotePath} on branch ${branch}`);
  const content = readFileSync(filePath, "base64");
  const response = await fetch(`${apiUrl}/contents/${remotePath}`, {
    method: "PUT",
    body: JSON.stringify({ message: commitMessage, content, branch }),
    headers: { Authorization: `token ${token}`, "Content-Type": "application/json" }
  });
  if (response.ok) console.log(`File uploaded: ${remotePath}`);
  else console.error(`Error uploading file ${remotePath}:`, await response.text());
}
async function processDirectory(directory) {
  const folderName = basename(directory);
  const [branchName, subFolderName] = folderName.split(" - ").map((part) => part.trim());
  console.log(`Processing directory: ${directory} -> branch: ${branchName}, folder: ${subFolderName}`);
  const branchExists = await fetchBranch(branchName);
  if (!branchExists) {
    console.log(`Branch ${branchName} does not exist. Creating it now.`);
    await createBranch(branchName);
  }
  const remoteFiles = await getRemoteFiles(branchName);
  const subdirectories = ["max"];
  for (const subdir of subdirectories) {
    const subdirPath = join(directory, subdir);
    if (statSync(subdirPath).isDirectory()) {
      const files = readdirSync(subdirPath);
      console.log(`Found files in ${subdirPath}: ${files.join(", ")}`);
      for (const file of files) {
        const filePath = join(subdirPath, file);
        const remotePath = `${subFolderName}/${subdir}/${file}`;
        if (!remoteFiles.has(remotePath)) {
          await uploadFileToGitHub(filePath, remotePath, branchName);
        } else {
          console.log(`File already exists on remote: ${remotePath}`);
        }
      }
    } else console.log(`No directory found: ${subdirPath}`);
  }
}
async function processAllDirectories() {
  for (const directory of directories) await processDirectory(directory);
  console.log("All directories processed successfully.");
}
processAllDirectories();
