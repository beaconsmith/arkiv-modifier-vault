import type { NextApiRequest, NextApiResponse } from 'next';
import { MODIFIERVAULT_STORAGE_MODE } from '../../lib/constants';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ storageMode: MODIFIERVAULT_STORAGE_MODE });
}
