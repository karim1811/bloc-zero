var JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhYjZkZmFkZi01OTcwLTRiNmYtODMyMy02MDA5OTk5NmRlNmUiLCJlbWFpbCI6Imthcmlta29uZHVhQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJlODBkZjA5OWQzYWU2NzA1OGMzYSIsInNjb3BlZEtleVNlY3JldCI6IjkyOTJkYWYyYzcwNDA2MzBmN2E2ZTczYjY1YTU5MmM2YzUxMTE5ZWU3YzQyNzg3MmRjMTI5NmFjMDhjNDA3YTgiLCJleHAiOjE4MDk5MDQ2MjR9.3nvPsbENJPwgr-oTMX4EFbZCQIzPBxNMimRYaCQ-Xns";
var lastCid = null;

function toast(msg, type) {
  var t = document.getElementById("toast");
  t.textContent = msg;
  t.style.opacity = "1";
  t.style.transform = "translateY(0)";
  t.style.borderColor = type === "ok" ? "#60c080" : "#e06060";
  t.style.color = type === "ok" ? "#60c080" : "#e06060";
  setTimeout(function () {
    t.style.opacity = "0";
    t.style.transform = "translateY(8px)";
  }, 4000);
}

async function submitArchive() {
  var title = document.getElementById("title").value.trim();
  var text = document.getElementById("doctext").value.trim();
  var author = document.getElementById("author").value.trim();

  if (!title) return toast("Ajoute un titre", "err");
  if (!text) return toast("Le contenu est vide", "err");

  var btn = document.getElementById("submitbtn");
  btn.disabled = true;
  btn.textContent = "Envoi en cours...";

  try {
    var payload = {
      title: title,
      author: author || "Anonyme",
      content: text,
      timestamp: new Date().toISOString(),
      source: "bloc-zero"
    };

    var res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + JWT
      },
      body: JSON.stringify({
        pinataContent: payload,
        pinataMeta { name: title },
        pinataOptions: { cidVersion: 1 }
      })
    });

    if (!res.ok) {
      var errText = await res.text();
      throw new Error("HTTP " + res.status + " - " + errText);
    }

    var data = await res.json();
    lastCid = data.IpfsHash;

    var url = "https://gateway.pinata.cloud/ipfs/" + lastCid;
    document.getElementById("r-title").textContent = title;
    document.getElementById("r-cid").textContent = lastCid;
    document.getElementById("r-url").innerHTML =
      '<a href="' + url + '" target="_blank" style="color:#a8e6a3">' + url + "</a>";

    document.getElementById("result").style.display = "block";
    toast("Archive publiee sur IPFS !", "ok");
  } catch (e) {
    console.error(e);
    toast("Erreur: " + e.message, "err");
  } finally {
    btn.disabled = false;
    btn.textContent = "Publier sur IPFS";
  }
}

function copyCid() {
  if (!lastCid) return;
  navigator.clipboard.writeText(lastCid).then(function () {
    toast("CID copie !", "ok");
  });
}
