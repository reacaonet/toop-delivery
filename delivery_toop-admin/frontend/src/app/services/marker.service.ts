import { Injectable } from '@angular/core';
import { PopUpService } from './pop-up.service';
import { DeliveryManService } from './deliveryMan.service';

import * as L from 'leaflet';

@Injectable({
  providedIn: 'root'
})
export class MarkerService {

  constructor(
    private popupService: PopUpService,
    private deliveryManService: DeliveryManService) {
  }

  makeMarkers(markersLayer: L.LayerGroup, status: string): void {
    markersLayer.clearLayers();

    const greenIcon = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png';
    const blueIcon = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png';
    const redIcon = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png';


    let isOnline = "";
    let onRoute = "";

    if (status !== '' && status !== 'all') {
      if (status === 'online' || status === 'offline') {
        isOnline = status === 'online' ? 'true' : 'false';
      }

      onRoute = status === 'onRoute' ? 'true' : 'false';
    }

    this.deliveryManService.getDeliveryManFilter(isOnline, onRoute, undefined).subscribe((data: any) => {
      data.forEach((deliveryMan) => {
        let icon;

        if (deliveryMan.isOnline) {
          icon = greenIcon;
        } else {
          icon = redIcon;
        }

        if (deliveryMan.flag === 'ON_ROUTE') {
          icon = blueIcon;
        }

        if (deliveryMan.location) {
          const markerOne = L.marker([deliveryMan.location.coordinates[1], deliveryMan.location.coordinates[0]], {
            icon: new L.Icon({
              iconUrl: icon,
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            })
          }).bindPopup(this.popupService.makePopup(deliveryMan), { showOnMouseOver: true });

          markersLayer.addLayer(markerOne);
        }
      });
    });
  }
}
