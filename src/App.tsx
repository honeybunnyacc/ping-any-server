import { useState } from "react";
import "../src/App.css";

function  App() {
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState("");
  const [result, setResult] = useState("");
  const onPing = () => {
    setBusy(true);

    try{
      const urlObject = new URL(url);
      // Randow query parameter to prevet caching.
      urlObject.searchParams.append(String(Math.random()), "");

      let beforePingTimestampt: number;
      fetch(`https://dns.google/resolve?name=${urlObject.hostname}`)
      // If hostname can be resolved, there's Answer field in response.
      .then((response) => response.json())
      .then((dnsLookup) => {
        if (dnsLookup.Answer) {
          beforePingTimestampt = Date.now();

          return fetch(urlObject.toString(), {
            // To save banwidth.
            method: "HEAD",
            // To consider first request without redirects only.
            redirect: "manual",
          }).catch(() => {
            // swallow all CORS errors.
          });
        } else {
          throw new Error();
        }
      })
      .then(() => {
        setResult(`Pign to ${url} is ${Date.now() - beforePingTimestampt}ms.`)
      })
      .catch((error) => {
        setResult(`Wasnt able to resolve ${urlObject.hostname} hostname.`)
      })
      .then(() => {
        setBusy(false)
      });
    }
    catch (error) {
          setResult(`${url} is not a valid URL.`);
          setBusy(false);
      }
    };

  const preventPageReloadandPing =  (e: React.FormEvent) => {
    e.preventDefault();

    onPing();
  }
  return (
    <div className="App">
      <form onSubmit={preventPageReloadandPing}>
        <input type="text" disabled={busy} onChange={(e) => setUrl(e.target.value)} />
        <button type="submit" disabled={busy || url === ""}>Ping</button>
      </form>
      {result ? <span>{result}</span> : null}
    </div>
  );
};

export default App;