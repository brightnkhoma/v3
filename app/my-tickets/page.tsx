"use client"

import { Ticket } from "@/app/lib/types";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getUserTicketsByTicketId } from "../lib/dataSource/contentDataSource";
import { RootState, useAppSelector } from "../lib/local/redux/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  Calendar, 
  MapPin, 
  Ticket as TicketIcon,
  ArrowLeft,
  User,
  QrCode,
  Loader2,
  FileText,
  Shield,
  CheckCircle,
  Clock,
  Sparkles,
  ScanLine,
  Crown,
  Zap,
  Palette
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { showToast } from "../lib/dataSource/toast";
import { cn } from "@/lib/utils";
import QRCode from "qrcode";
import { firestoreTimestampToDate } from "../lib/config/timestamp";
declare global {
    interface CanvasRenderingContext2D {
        roundRect(x: number, y: number, w: number, h: number, r: number): void;
    }
}

const MyTickets = () => {
    
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [downloading, setDownloading] = useState<string | null>(null);
    const eventId = useSearchParams().get("eventId");
    const { user } = useAppSelector((state: RootState) => state.auth);
    const router = useRouter();

    const onGetMyTickets = useCallback(async () => {
        if (!eventId || !user) {
            setLoading(false);
            return;
        }
        
        try {
            setLoading(true);
            const _tickets = await getUserTicketsByTicketId(eventId, user);
            setTickets(_tickets || []);
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
            showToast("Failed to load your tickets", {type: "error"});
            setTickets([]);
        } finally {
            setLoading(false);
        }
    }, [eventId, user]);

    useEffect(() => {
        onGetMyTickets();
    }, [onGetMyTickets]);

    const formatDate = (date: Date) => {
        return format(new Date(date), 'EEEE, MMMM dd, yyyy');
    };

    const formatTime = (date: Date) => {
        try {
            return format(new Date(date), 'h:mm a');
            
        } catch (error) {
            return format(new Date((firestoreTimestampToDate(date as any))), 'h:mm a');
            
        }
    };

    const generateTicketId = (ticket: Ticket, index: number): string => {
        const chars = '23456789BCDFGHJKMNPQRSTVWXYZ';
        const bytes = new Uint8Array(6);
        crypto.getRandomValues(bytes);
        let uniquePart = '';
        for (let i = 0; i < 6; i++) {
            uniquePart += chars[bytes[i] % chars.length];
        }
        return `${ticket.id.slice(-3)}-${uniquePart}`.toUpperCase();
    };

    const generateQRCode = async (ticketData: string): Promise<string> => {
        try {
            // Use actual color values instead of CSS variables
            const qrCodeDataUrl = await QRCode.toDataURL(ticketData, {
                width: 180,
                margin: 1,
                color: {
                    dark: '#1e40af', // blue-800
                    light: '#ffffff'
                }
            });
            return qrCodeDataUrl;
        } catch (error) {
            console.error('Error generating QR code:', error);
            throw error;
        }
    };

   const downloadTicket = async (ticket: Ticket, index: number) => {
    setDownloading(ticket.id);
    
    try {
        const ticketId = generateTicketId(ticket, index);
        const qrCodeData = JSON.stringify({
            ticketId,
            eventId: ticket.id,
            eventName: ticket.name,
            category: ticket.purchasedCategory?.name,
            purchaser: user?.email,
            timestamp: new Date().toISOString()
        });

        const qrCodeUrl = await generateQRCode(qrCodeData);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not create canvas context');

        canvas.width = 887;
        canvas.height = 386;

        const templateImg = new Image();
        templateImg.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
            templateImg.onload = resolve;
            templateImg.onerror = reject;
            templateImg.src = '/images/tmps.png';
        });

        ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

        const qrCodeImg = new Image();
        qrCodeImg.src = qrCodeUrl;
        await new Promise((resolve) => {
            qrCodeImg.onload = resolve;
        });

        const qrCodeSize = 200;
        const qrCodeX = 10; 
        const qrCodeY = 10;
        ctx.drawImage(qrCodeImg, qrCodeX, qrCodeY, qrCodeSize, qrCodeSize);

        ctx.fillStyle = '#000000'; 
        ctx.font = 'bold 14px "Inter", "Arial", sans-serif';
        
        ctx.fillText(`ID: ${ticketId}`, qrCodeX, qrCodeY + qrCodeSize + 50);
        
        ctx.font = '12px "Inter", "Arial", sans-serif';
        ctx.fillText(`Purchaser:`, qrCodeX, qrCodeY + qrCodeSize + 70);
        ctx.fillText(user?.name || 'User', qrCodeX, qrCodeY + qrCodeSize + 55 + 30);
        ctx.fillText(user?.email || 'User', qrCodeX, qrCodeY + qrCodeSize + 55 + 47 );
        
        ctx.fillText(`Purchased:`, qrCodeX, qrCodeY + qrCodeSize  + 90 + 30);
        ctx.fillText(
            ticket.datePurchased 
                ? format(new Date(firestoreTimestampToDate(ticket.datePurchased as any)), 'MMM dd, yyyy')
                : 'N/A', 
            qrCodeX, 
            qrCodeY + qrCodeSize + 75+ 60 
        );

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 20px "Inter", "Arial", sans-serif';
        
        const eventX = 250;
        const eventY = 140; 
        ctx.fillText(`EVENT : ${ticket.name}`, eventX, eventY);

        const dateTimeY = 180;
        const dateTimeText = `${formatDate(ticket.eventStartDate)} • ${formatTime(ticket.eventStartDate)}`;
        ctx.fillText( `DATE :  ${dateTimeText}`, eventX, dateTimeY);

        const admissionY = 220;
        ctx.fillText("ADMISSION : " + ticket.purchasedCategory?.name || 'General Admission', eventX, admissionY);

        const priceY = 260;
        ctx.fillText(`PRICE : MK${ticket.purchasedCategory?.commission?.total || ticket.purchasedCategory?.price || 0}`, eventX, priceY);

        ctx.font = '10px "Inter", "Arial", sans-serif';
        ctx.fillStyle = '#666666';
        ctx.fillText(`Secure Digital Ticket • ${ticketId}`, 20, 370);
        ctx.fillText(`Generated ${format(new Date(), 'MMM dd, yyyy h:mm a')}`, 20, 380);

        canvas.toBlob((blob) => {
            if (blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `ticket-${ticketId}.png`;
                link.href = url;
                link.click();
                URL.revokeObjectURL(url);
                showToast("Ticket downloaded successfully!", {type: "success"});
            }
        }, 'image/png', 1.0);

    } catch (error) {
        console.error('Error generating ticket:', error);
        showToast("Failed to download ticket", {type: "error"});
    } finally {
        setDownloading(null);
    }
};



function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    return ctx;
}





if (CanvasRenderingContext2D.prototype.roundRect === undefined) {
    CanvasRenderingContext2D.prototype.roundRect = function(x: number, y: number, w: number, h: number, r: number) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
    }
}

    const downloadAllTickets = async () => {
        for (let i = 0; i < tickets.length; i++) {
            await downloadTicket(tickets[i], i);
            await new Promise(resolve => setTimeout(resolve, 800));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-6">
                    <div className="relative">
                        <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                            <TicketIcon className="w-10 h-10 text-primary-foreground" />
                        </div>
                        <Sparkles className="w-6 h-6 text-primary-foreground/80 absolute -top-2 -right-2 animate-pulse" />
                    </div>
                    <div>
                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground text-lg font-medium">Loading your tickets...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                onClick={() => router.back()}
                                className="flex items-center gap-2 hover:bg-accent transition-all duration-200 group"
                            >
                                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                Back
                            </Button>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary rounded-xl shadow-sm">
                                    <TicketIcon className="w-5 h-5 text-primary-foreground" />
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                        My Tickets
                                    </h1>
                                    <p className="text-muted-foreground text-sm">
                                        {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} purchased
                                    </p>
                                </div>
                            </div>
                        </div>

                        {tickets.length > 0 && (
                            <Button
                                onClick={downloadAllTickets}
                                disabled={downloading !== null}
                                className="flex items-center gap-2"
                            >
                                {downloading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Download className="w-4 h-4" />
                                )}
                                Download All
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {tickets.length === 0 ? (
                    <div className="text-center py-16 sm:py-24">
                        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                            <TicketIcon className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                            No Tickets Found
                        </h2>
                        <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto leading-relaxed">
                            {eventId 
                                ? "You haven't purchased any tickets for this event yet."
                                : "No event specified or you haven't purchased any tickets."
                            }
                        </p>
                        <Button 
                            onClick={() => router.push('/events')}
                            size="lg"
                        >
                            <Palette className="w-5 h-5 mr-2" />
                            Browse Events
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Event Summary */}
                        {tickets[0] && (
                            <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 shadow-lg">
                                <CardContent className="p-6 sm:p-8">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Crown className="w-5 h-5" />
                                                <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0">
                                                    Your Event
                                                </Badge>
                                            </div>
                                            <h2 className="text-xl sm:text-2xl font-bold mb-2">
                                                {tickets[0].name}
                                            </h2>
                                            <div className="flex flex-wrap items-center gap-4 text-primary-foreground/90 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{formatDate(tickets[0].eventStartDate)}</span>
                                                </div>
                                                {tickets[0].location && (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{tickets[0].location.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-center sm:text-right">
                                            <div className="text-2xl sm:text-3xl font-bold">{tickets.length}</div>
                                            <div className="text-primary-foreground/80 text-sm">Ticket{tickets.length !== 1 ? 's' : ''}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Tickets Grid */}
                        <div className="grid gap-6">
                            {tickets.map((ticket, index) => (
                                <Card key={`${ticket.id}-${index}`} className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow duration-300">
                                    <CardHeader className="bg-muted/50 pb-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-green-500 rounded-lg">
                                                    <CheckCircle className="w-4 h-4 text-white" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg flex flex-col sm:flex-row sm:items-center gap-2">
                                                        <span className="text-foreground">
                                                            Ticket #{generateTicketId(ticket, index)}
                                                        </span>
                                                        <Badge variant="secondary" className="w-fit">
                                                            {ticket.purchasedCategory?.name || 'General'}
                                                        </Badge>
                                                    </CardTitle>
                                                    <CardDescription className="flex items-center gap-2 mt-1">
                                                        <Zap className="w-3 h-3 text-green-500" />
                                                        Purchased on {ticket.datePurchased ? format(firestoreTimestampToDate(ticket.datePurchased as any), 'MMM dd, yyyy • h:mm a') : 'N/A'}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            <Badge className="bg-green-500 text-white border-0">
                                                Confirmed
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="grid lg:grid-cols-3 gap-6">
                                            {/* Ticket & Event Details */}
                                            <div className="lg:col-span-2 space-y-6">
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    {/* Ticket Details */}
                                                    <div className="space-y-4">
                                                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                                                            <FileText className="w-4 h-4" />
                                                            Ticket Details
                                                        </h4>
                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-center py-2 border-b">
                                                                <span className="text-muted-foreground text-sm">Event</span>
                                                                <span className="font-medium text-foreground text-sm text-right">{ticket.name}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center py-2 border-b">
                                                                <span className="text-muted-foreground text-sm">Category</span>
                                                                <span className="font-medium text-foreground text-sm">{ticket.purchasedCategory?.name}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center py-2">
                                                                <span className="text-muted-foreground text-sm">Price</span>
                                                                <span className="font-medium text-foreground text-sm">MK{ticket.purchasedCategory?.commission?.total ||ticket.purchasedCategory?.price}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Attendee Info */}
                                                    <div className="space-y-4">
                                                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                                                            <User className="w-4 h-4" />
                                                            Attendee Info
                                                        </h4>
                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-center py-2 border-b">
                                                                <span className="text-muted-foreground text-sm">Name</span>
                                                                <span className="font-medium text-foreground text-sm">{user?.name || user?.email || 'Guest'}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center py-2">
                                                                <span className="text-muted-foreground text-sm">Email</span>
                                                                <span className="font-medium text-foreground text-sm">{user?.email}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <Separator />

                                                {/* Event Information */}
                                                <div className="space-y-4">
                                                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        Event Information
                                                    </h4>
                                                    <div className="grid sm:grid-cols-2 gap-4">
                                                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                                            <Calendar className="w-4 h-4 text-primary" />
                                                            <div>
                                                                <div className="font-medium text-foreground text-sm">
                                                                    {formatDate(ticket.eventStartDate)}
                                                                </div>
                                                                <div className="text-muted-foreground text-xs">
                                                                    {formatTime(ticket.eventStartDate)}
                                                                    {ticket.eventEndDate && ` - ${formatTime(ticket.eventEndDate)}`}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {ticket.location && (
                                                            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                                                <MapPin className="w-4 h-4 text-primary" />
                                                                <div>
                                                                    <div className="font-medium text-foreground text-sm">
                                                                        {ticket.location.name}
                                                                    </div>
                                                                    <div className="text-muted-foreground text-xs">
                                                                        {ticket.location.description}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* QR Code & Download Section */}
                                            <div className="space-y-4">
                                                <Card className="bg-muted/50 border">
                                                    <CardContent className="p-4">
                                                        <div className="text-center mb-3">
                                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                                <ScanLine className="w-4 h-4 text-primary" />
                                                                <span className="font-semibold text-foreground text-sm">Digital Ticket</span>
                                                            </div>
                                                            <div className="bg-background p-3 rounded-lg mb-3">
                                                                <div className="w-full aspect-square bg-muted rounded flex items-center justify-center">
                                                                    <QrCode className="w-12 h-12 text-muted-foreground" />
                                                                </div>
                                                            </div>
                                                            <p className="text-muted-foreground text-xs">
                                                                Scan at event entrance
                                                            </p>
                                                        </div>

                                                        <Button
                                                            onClick={() => downloadTicket(ticket, index)}
                                                            disabled={downloading === ticket.id}
                                                            className="w-full"
                                                            size="sm"
                                                        >
                                                            {downloading === ticket.id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                            ) : (
                                                                <Download className="w-4 h-4 mr-2" />
                                                            )}
                                                            Download Ticket
                                                        </Button>
                                                    </CardContent>
                                                </Card>

                                                {/* Security Badge */}
                                                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                                    <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                    <div>
                                                        <div className="font-medium text-green-900 dark:text-green-100 text-sm">
                                                            Secured Ticket
                                                        </div>
                                                        <div className="text-green-700 dark:text-green-300 text-xs">
                                                            Ready for use
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Important Information */}
                        <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-4 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Important Information
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                                    <ul className="text-amber-800 dark:text-amber-200 space-y-2">
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                                            <span>Arrive 30 minutes before event</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                                            <span>Bring valid ID</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                                            <span>One ticket per person</span>
                                        </li>
                                    </ul>
                                    <ul className="text-amber-800 dark:text-amber-200 space-y-2">
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                                            <span>Non-transferable</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                                            <span>Have ticket ready</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                                            <span>No refunds</span>
                                        </li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyTickets;