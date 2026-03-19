import { environment } from "./../../environments/environment";

export class MyUploadAdapter {
	public loader: any;
	public url: string;
	public xhr: XMLHttpRequest;
	public token: string;

	constructor(loader) {
		this.loader = loader;

		this.url = `${environment.apiURL}/send-files`;
	}

	upload() {
		return new Promise(async (resolve, reject) => {
			this.loader.file.then((file) => {
				this._initRequest();
				this._initListeners(resolve, reject, file);
				this._sendRequest(file);
			});
		});
	}

	abort() {
		if (this.xhr) {
			this.xhr.abort();
		}
	}

	_initRequest() {
		const xhr = (this.xhr = new XMLHttpRequest());
		xhr.open("POST", this.url, true);

		// change "Authorization" header with your header
		xhr.setRequestHeader("Authorization", this.token);

		xhr.responseType = "json";
	}

	_initListeners(resolve, reject, file) {
		const xhr = this.xhr;
		const loader = this.loader;
		const genericErrorText = "Couldn't upload file:" + ` ${file.name}.`;

		xhr.addEventListener("error", () => reject(genericErrorText));
		xhr.addEventListener("abort", () => reject());

		xhr.addEventListener("load", () => {
			const response = xhr.response;

			if (!response || response.error) {
				return reject(
					response && response.error ? response.error.message : genericErrorText
				);
			}
			resolve({
				default: response.data,
			});
		});

		if (xhr.upload) {
			xhr.upload.addEventListener("progress", (evt) => {
				if (evt.lengthComputable) {
					loader.uploadTotal = evt.total;
					loader.uploaded = evt.loaded;
				}
			});
		}
	}

	_sendRequest(file) {
		const data = new FormData();

		// change "attachments" key
		data.append("file", file);
		data.append("folder", "ckeditor");

		this.xhr.send(data);
	}
}
