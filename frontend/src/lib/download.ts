export async function downloadPdfFromEndpoint(
  endpointUrl: string,
  suggestedFilename: string
): Promise<boolean> {
  const token = typeof window !== "undefined" ? localStorage.getItem("agrinex_token") : null;
  const filename = suggestedFilename.toLowerCase().endsWith(".pdf")
    ? suggestedFilename
    : `${suggestedFilename}.pdf`;

  const separator = endpointUrl.includes("?") ? "&" : "?";
  const directDownloadUrl = token
    ? `${endpointUrl}${separator}token=${encodeURIComponent(token)}`
    : endpointUrl;

  try {
    // 1. Direct fetch to retrieve the exact PDF byte stream
    const res = await fetch(directDownloadUrl, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (res.ok) {
      const blob = await res.blob();
      if (blob.size > 0) {
        // Explicitly enforce application/pdf
        const pdfBlob = new Blob([blob], { type: "application/pdf" });
        const blobUrl = window.URL.createObjectURL(pdfBlob);

        const a = document.createElement("a");
        a.style.display = "none";
        a.href = blobUrl;
        a.download = filename;
        a.setAttribute("download", filename);
        a.setAttribute("type", "application/pdf");
        a.target = "_self";
        a.rel = "noopener";
        document.body.appendChild(a);
        
        // Trigger download
        a.click();

        // Keep blob URL in memory for 2 minutes so browser download thread has plenty of time to write to local disk
        setTimeout(() => {
          try {
            if (a.parentNode) document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
          } catch (_) {}
        }, 120000);

        return true;
      }
    }
    throw new Error(`Fetch returned status: ${res.status}`);
  } catch (fetchErr) {
    console.warn("Direct blob download failed, attempting native browser navigation download:", fetchErr);
    
    // Fallback: Use direct anchor download on URL with .pdf extension and Content-Disposition
    try {
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = directDownloadUrl;
      a.download = filename;
      a.setAttribute("download", filename);
      a.setAttribute("type", "application/pdf");
      a.target = "_self";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        try {
          if (a.parentNode) document.body.removeChild(a);
        } catch (_) {}
      }, 5000);
      return true;
    } catch (_) {
      window.location.href = directDownloadUrl;
      return true;
    }
  }
}
