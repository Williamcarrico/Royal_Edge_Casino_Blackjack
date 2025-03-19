'use client'

import { ReactElement, useState, useEffect } from 'react';
import { PDFDownloadLink, Document } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Loader2, FileDown } from 'lucide-react';

interface PDFButtonProps {
    document: ReactElement<typeof Document>;
    fileName: string;
    children?: ReactElement | string;
}

export function PDFDownloadButton({ document, fileName, children }: PDFButtonProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <Button
                variant="outline"
                size="sm"
                disabled
                className="flex items-center"
            >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparing PDF...
            </Button>
        );
    }

    return (
        <PDFDownloadLink
            document={document}
            fileName={fileName}
        >
            {({ loading }) => (
                <Button
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    className="flex items-center"
                >
                    {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <FileDown className="mr-2 h-4 w-4" />
                    )}
                    {loading ? 'Generating PDF...' : children || 'Download PDF'}
                </Button>
            )}
        </PDFDownloadLink>
    );
}