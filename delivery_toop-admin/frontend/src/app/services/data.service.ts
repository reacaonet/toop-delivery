import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

@Injectable({
	providedIn: "root",
})
export class DataService {
	private dataChanged = new Subject<any>();

	getDataChanged(): Observable<any> {
		return this.dataChanged.asObservable();
	}

	updateData(data: any) {
		this.dataChanged.next(data);
	}
}
