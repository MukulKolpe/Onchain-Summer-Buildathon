// @ts-nocheck comment
import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../utils/db/supaBaseClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { optionId } = req.body;
  if (optionId === -1) {
    let { data: options_bid, error } = await supabase
      .from("options_bid")
      .select("*")
      .order("created_at", { ascending: false });

    if (options_bid) {
      res.status(200).json(options_bid);
    }

    if (error) {
      console.log(error);
      res.status(500).end();
    }
  } else {
    let { data: options_bid, error } = await supabase
      .from("options_bid")
      .select("*")
      .eq("option_id", optionId)
      .order("created_at", { ascending: false });

    if (options_bid) {
      res.status(200).json(options_bid);
    }

    if (error) {
      console.log(error);
      res.status(500).end();
    }
  }
}
