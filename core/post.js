import dotenv from "dotenv";
import fetch from "node-fetch";
import { join, basename } from "path";
import { readFileSync, readdirSync, statSync } from "fs";

dotenv.config({ path: "../.env" });
const repo = "picWall";
const owner = "yt-dlx";
const token = process.env.GITHUB_TOKEN;
const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;

// Utility to fetch GitHub API headers
const getHeaders = () => ({
  Authorization: `token ${token}`,
  "Content-Type": "application/json"
});

// Log uploaded details to console
function logUploadedDetails(uploadedFiles) {
  console.log("\nUploaded Files:");
  uploadedFiles.forEach((file) => {
    console.log(`- Branch: ${file.branch}, Path: ${file.path}, Status: ${file.status}`);
  });
}

// Upload a single file to GitHub
async function uploadFile(filePath, remotePath, branch) {
  try {
    const content = readFileSync(filePath, "base64");
    const response = await fetch(`${apiUrl}/contents/${remotePath}`, {
      method: "PUT",
      body: JSON.stringify({
        message: "commitMessage",
        content,
        branch
      }),
      headers: getHeaders()
    });

    if (response.ok) {
      return { branch, path: remotePath, status: "Uploaded Successfully" };
    } else {
      const error = await response.text();
      return { branch, path: remotePath, status: `Failed: ${error}` };
    }
  } catch (error) {
    return { branch, path: remotePath, status: `Error: ${error.message}` };
  }
}

// Process a directory and upload its contents
async function processDirectory(directory, branch) {
  const uploadedFiles = [];

  try {
    const files = readdirSync(directory);
    console.log(`Processing directory: ${directory}`);

    for (const file of files) {
      const filePath = join(directory, file);

      if (statSync(filePath).isFile()) {
        const remotePath = `${basename(directory)}/${file}`;
        const uploadStatus = await uploadFile(filePath, remotePath, branch);
        uploadedFiles.push(uploadStatus);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${directory}:`, error);
  }

  logUploadedDetails(uploadedFiles);
}

// Main function to handle uploading from multiple directories
async function uploadDirectories(basePath) {
  try {
    const directories = readdirSync(basePath)
      .map((dir) => join(basePath, dir))
      .filter((path) => statSync(path).isDirectory());

    for (const directory of directories) {
      const branchName = basename(directory);
      await processDirectory(directory, branchName);
    }
  } catch (error) {
    console.error("Error uploading directories:", error);
  }
}

// Start the process
uploadDirectories("./assets/output");
