


/**
 * Format bytes as human-readable text.
 * 
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use 
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 * 
 * @return Formatted string.
 */
 /*function humanFileSize(bytes, si=false, dp=1) {
	const thresh = si ? 1000 : 1024;
  
	if (Math.abs(bytes) < thresh) {
	  return bytes + ' B';
	}
  
	const units = si 
	  ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
	  : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
	let u = -1;
	const r = 10**dp;
  
	do {
	  bytes /= thresh;
	  ++u;
	} while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
  
  
	return bytes.toFixed(dp) + ' ' + units[u];
  }
  
  
  console.log(humanFileSize(1551859712))  // 1.4 GiB
  console.log(humanFileSize(5000, true))  // 5.0 kB
  console.log(humanFileSize(5000, false))  // 4.9 KiB
  console.log(humanFileSize(-10000000000000000000000000000))  // -8271.8 YiB
  console.log(humanFileSize(999949, true))  // 999.9 kB
  console.log(humanFileSize(999950, true))  // 1.0 MB
  console.log(humanFileSize(999950, true, 2))  // 999.95 kB
  console.log(humanFileSize(999500, true, 0))  // 1 MB
*/











const humanReadableFileSize = (bytes)=>{
	const dp = 2;
	const thresh = 1024;
  
	if (Math.abs(bytes) < thresh) {
	  return bytes + ' B';
	}
  
	const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	let u = -1;
	const r = 10**dp;
  
	do {
	  bytes /= thresh;
	  ++u;
	} while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
  
  
	return (bytes.toFixed(dp)).replace(".", ",") + ' ' + units[u];
}







const iconForMIME = (mime_type)=>{

	//let type = "🔗";
	let type = "📄";
	if (mime_type){
		type = mime_type.split("/")[0];

		type = (()=>{
			switch(type){

				case("application"):
					let precise = mime_type.split("/")[1];
					if ((precise == "pdf")/* || (precise == "msword")*/)
						return "📜"; //📃📜

					return "🗜";

				case("audio"):
					return "🔊";

				case("chemical"):
					return "🔬";

				case("font"):
					return "🔠";

				case("example"):
					return "🔰";

				case("image"):
					return "🖼";

				case("message"):
					return "✉️";

				case("model"):
					return "🧱"; //return "💠";

				case("multipart"):
					return "💠";

				case("text"):
					return "📝";

				case("video"):
					return "🎞";

				case("xgl"):
					return "🖼";

				case("x-world"):
					return "🗜";
			}
		})()
	}



	return <span className="px-1" style={{
		backgroundColor: "rgba(13,110,253, 0.25)",
    	borderRadius: "0.5rem",
		fontFamily: "apple color emoji,segoe ui emoji,noto color emoji,android emoji,emojisymbols,emojione mozilla,twemoji mozilla,segoe ui symbol"
	}}>
		{type}
	</span>;
}







export { humanReadableFileSize, iconForMIME }