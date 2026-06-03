import Home from "../../front/pages/public/Home";

function PreviewHome() {
  let previewSettings = null;

  try {
    const raw = sessionStorage.getItem("websitePreviewSettings");
    previewSettings = raw ? JSON.parse(raw) : null;
  } catch {
    previewSettings = null;
  }

  return <Home previewSettings={previewSettings} />;
}

export default PreviewHome;
