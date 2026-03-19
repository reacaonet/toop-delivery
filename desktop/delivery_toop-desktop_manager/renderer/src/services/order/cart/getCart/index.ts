import axios from "axios";
import { setupApiClient } from "../../../api"

const params = {
    delivery: true,
    type: "restaurant",
    updateCard: false
}

export async function getCart(cartId:String){
    const api = setupApiClient();
    const { data } = await api.get(`shopping/cart/current/${cartId}`, {
        params
    })

    return data;
}