
export function formatDuration(durationMs) {
  if (durationMs < 1000) {
    return `${durationMs} ms`;
  } else if (durationMs < 60000) {
    return `${(durationMs / 1000).toFixed(2)} seconds`;
  } else if (durationMs < 3600000) {
    return `${(durationMs / 60000).toFixed(2)} minutes`;
  } else {
    return `${(durationMs / 3600000).toFixed(2)} hours`;
  }
}


