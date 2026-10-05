import React, { useEffect, useState } from 'react';
import { Text, Box } from 'ink';
import qrcode from 'qrcode';

export default function QRCode({ url }: { url: string }) {
    const [qrCodeStr, setQrCodeStr] = useState<string>('');

    useEffect(() => {
        if (!url) {
            setQrCodeStr('');
            return;
        }
        
        qrcode.toString(url, { type: 'terminal', small: true, margin: 1 }, (err, str) => {
            if (!err && str) {
                setQrCodeStr(str);
            } else if (err) {
                setQrCodeStr('Error generating QR');
            }
        });
    }, [url]);

    if (!qrCodeStr) return null;

    return <Text>{qrCodeStr}</Text>;
}
