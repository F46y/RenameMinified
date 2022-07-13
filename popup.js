var folderHandle = null;

document.getElementById("pickFolder").addEventListener("click", async () => {
	folderHandle = await window.showDirectoryPicker();

	const root = await navigator.storage.getDirectory();
	// Create a new directory handle.
	const dirHandle = await root.getDirectoryHandle(folderHandle.name, {
		create: false,
	});
	console.log(dirHandle);
});

document.getElementById("rename").addEventListener("click", () => {
	if (folderHandle != null) {
		rename();
	}
});

async function rename() {
	for await (const entry of folderHandle.values()) {
		await getFilesRecursively(entry);
	}
}

async function getFilesRecursively(entry) {
	if (entry.kind === "directory") {
		for await (const handle of entry.values()) {
			await getFilesRecursively(handle);
		}
	} else {
		await new Promise((x) => {
			entry.getFile().then(async (file) => {
				if (file.name.includes(".min.")) {
					var newFilename = file.name.replace(".min.", ".");
					if ((await verifyPermission(entry, true)) == true)
						await entry.move(newFilename);
				}
				x();
			});
		});
	}
}
async function verifyPermission(fileHandle, withWrite) {
	const opts = {};
	if (withWrite) {
		opts.mode = "readwrite";
	}

	// Check if we already have permission, if so, return true.
	if ((await fileHandle.queryPermission(opts)) === "granted") {
		return true;
	}

	// Request permission to the file, if the user grants permission, return true.
	if ((await fileHandle.requestPermission(opts)) === "granted") {
		return true;
	}

	// The user did not grant permission, return false.
	return false;
}
