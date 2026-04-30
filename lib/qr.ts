import QRCode from 'qrcode';

/**
 * Generates a Base64 Data URL for a QR Code
 * @param text The string to encode (usually the session token)
 * @returns Promise<string>
 */
export const generateQRCode = async (text: string): Promise<string> => {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    return dataUrl;
  } catch (err) {
    console.error('QR Generation Error:', err);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Validates if a string is a valid format (optional helper)
 */
export const isValidQRToken = (token: string): boolean => {
  // Simple check for hex string of 64 chars (32 bytes)
  return /^[a-f0-9]{64}$/i.test(token);
};
