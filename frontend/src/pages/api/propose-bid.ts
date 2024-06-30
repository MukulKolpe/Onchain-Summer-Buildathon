// @ts-nocheck comment
import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../utils/supabase/supaBaseClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { price, quantity, optionId, address } = req.body;
  const { data, error } = await supabase
    .from("options_bid")
    .insert([
      {
        option_id: optionId,
        price: price,
        quantity: quantity,
        user_address: address,
      },
    ])
    .select()
    .order("created_at", { ascending: false });
  if (error) {
    console.error(error);
    res.status(500).end();
    return;
  }

  res.status(200).send(data);
}
