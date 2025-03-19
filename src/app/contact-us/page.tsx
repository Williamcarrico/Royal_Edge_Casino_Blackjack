/** @jsxImportSource react */
'use client';

import React, { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    MapPin, Phone, Mail, Clock, Send, CheckCircle,
    Facebook, Twitter, Instagram, Linkedin
} from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/ui/forms/form';
import { Input } from '@/ui/forms/input';
import { Textarea } from '@/ui/forms/textarea';
import { Button } from '@/ui/layout/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/layout/card';
import { cn } from '@/lib/utils';

// Animation variants
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    }
};

const glowVariants: Variants = {
    initial: { opacity: 0 },
    animate: {
        opacity: [0.2, 0.4, 0.2],
        scale: [1, 1.1, 1],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

// Form validation schema
const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    phone: z.string().optional(),
    subject: z.string().min(5, { message: "Subject must be at least 5 characters" }),
    message: z.string().min(10, { message: "Message must be at least 10 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

// Business information
const businessInfo = {
    name: "House Edge Casino Blackjack",
    address: "123 Casino Ave, Gulf Breeze, FL 32561",
    phone: "(850) 555-1234",
    email: "info@houseedgecasino.com",
    hours: [
        { days: "Monday - Thursday", time: "12:00 PM - 12:00 AM" },
        { days: "Friday - Saturday", time: "10:00 AM - 2:00 AM" },
        { days: "Sunday", time: "12:00 PM - 10:00 PM" },
    ],
    socialMedia: [
        { name: "Facebook", icon: <Facebook className="w-5 h-5" />, url: "https://facebook.com/houseedgecasino" },
        { name: "Twitter", icon: <Twitter className="w-5 h-5" />, url: "https://twitter.com/houseedgecasino" },
        { name: "Instagram", icon: <Instagram className="w-5 h-5" />, url: "https://instagram.com/houseedgecasino" },
        { name: "LinkedIn", icon: <Linkedin className="w-5 h-5" />, url: "https://linkedin.com/company/houseedgecasino" },
    ]
};

// FAQ Questions
const faqItems = [
    {
        question: "What are your operating hours?",
        answer: "We are open Monday through Thursday from 12 PM to 12 AM, Friday and Saturday from 10 AM to 2 AM, and Sunday from 12 PM to 10 PM."
    },
    {
        question: "Do you offer private blackjack lessons?",
        answer: "Yes, we offer private blackjack lessons with our experienced dealers. Contact us to schedule a session."
    },
    {
        question: "Is there a dress code?",
        answer: "We recommend smart casual attire. No beachwear, athletic wear, or flip-flops please."
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards, cash, and digital payment methods including Apple Pay and Google Pay."
    }
];

export default function ContactUs() {
    const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            subject: "",
            message: "",
        },
    });

    const onSubmit = async (data: FormValues) => {
        setFormStatus('submitting');

        // Simulate API call
        try {
            // In a real application, you would send the form data to your backend
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log("Form submitted:", data);
            setFormStatus('success');
            form.reset();
        } catch (error) {
            console.error("Error submitting form:", error);
            setFormStatus('error');
        }
    };

    return (
        <motion.div
            className="min-h-screen px-4 py-16 bg-gradient-to-b from-background to-background/80"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="max-w-6xl mx-auto space-y-16">
                {/* Hero Section */}
                <motion.section
                    variants={itemVariants}
                    className="relative space-y-6 text-center"
                >
                    <motion.div
                        className="absolute inset-0 pointer-events-none"
                        variants={glowVariants}
                        initial="initial"
                        animate="animate"
                    >
                        <div className="absolute inset-0 opacity-50 bg-gradient-radial from-primary/20 to-transparent blur-3xl" />
                    </motion.div>

                    <h1 className="text-4xl font-bold text-transparent md:text-6xl bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                        Contact Us
                    </h1>
                    <p className="max-w-3xl mx-auto text-xl text-muted-foreground">
                        Have questions or want to learn more about our blackjack tables? Get in touch with our team.
                    </p>
                </motion.section>

                {/* Main Contact Section */}
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                    {/* Contact Form */}
                    <motion.div
                        variants={itemVariants}
                        className="lg:col-span-2"
                    >
                        <Card className={cn(
                            "p-6 backdrop-blur-sm border transition-all duration-300",
                            "bg-card/50 border-primary/10 hover:border-primary/30",
                            "dark:bg-card/30 dark:border-primary/20 dark:hover:border-primary/40"
                        )}>
                            <CardHeader>
                                <CardTitle className="text-2xl">Send Us a Message</CardTitle>
                                <CardDescription>
                                    Fill out the form below and we&apos;ll get back to you as soon as possible.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {formStatus === 'success' ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex flex-col items-center justify-center p-6 text-center"
                                    >
                                        <CheckCircle className="w-16 h-16 mb-4 text-green-500" />
                                        <h3 className="mb-2 text-xl font-semibold">Message Sent!</h3>
                                        <p className="mb-6 text-muted-foreground">
                                            Thank you for contacting us. We&apos;ll respond to your inquiry shortly.
                                        </p>
                                        <Button
                                            variant="outline"
                                            onClick={() => setFormStatus('idle')}
                                        >
                                            Send Another Message
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                                <FormField
                                                    control={form.control}
                                                    name="name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Full Name</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Your name" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="email"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Email</FormLabel>
                                                            <FormControl>
                                                                <Input type="email" placeholder="Your email address" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                                <FormField
                                                    control={form.control}
                                                    name="phone"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Phone (Optional)</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Your phone number" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="subject"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Subject</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Message subject" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="message"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Message</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="How can we help you?"
                                                                className="min-h-[150px]"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <Button
                                                type="submit"
                                                className="w-full text-black bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400"
                                                disabled={formStatus === 'submitting'}
                                            >
                                                {formStatus === 'submitting' ? (
                                                    <span className="flex items-center">
                                                        <svg className="w-5 h-5 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Sending...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center">
                                                        <Send className="w-5 h-5 mr-2" />
                                                        Send Message
                                                    </span>
                                                )}
                                            </Button>
                                        </form>
                                    </Form>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Contact Information */}
                    <motion.div variants={itemVariants} className="space-y-6">
                        <Card className={cn(
                            "p-6 backdrop-blur-sm border transition-all duration-300",
                            "bg-card/50 border-primary/10",
                            "dark:bg-card/30 dark:border-primary/20"
                        )}>
                            <CardHeader>
                                <CardTitle className="text-2xl">Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <MapPin className="w-5 h-5 mt-0.5 text-primary" />
                                        <div>
                                            <h3 className="font-medium">Address</h3>
                                            <p className="text-muted-foreground">{businessInfo.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <Phone className="w-5 h-5 mt-0.5 text-primary" />
                                        <div>
                                            <h3 className="font-medium">Phone</h3>
                                            <p className="text-muted-foreground">{businessInfo.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <Mail className="w-5 h-5 mt-0.5 text-primary" />
                                        <div>
                                            <h3 className="font-medium">Email</h3>
                                            <p className="text-muted-foreground">{businessInfo.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-primary/10">
                                    <div className="flex items-start space-x-3">
                                        <Clock className="w-5 h-5 mt-0.5 text-primary" />
                                        <div>
                                            <h3 className="font-medium">Business Hours</h3>
                                            <div className="mt-2 space-y-2">
                                                {businessInfo.hours.map((schedule) => (
                                                    <div key={schedule.days} className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">{schedule.days}</span>
                                                        <span>{schedule.time}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-primary/10">
                                    <h3 className="font-medium">Connect With Us</h3>
                                    <div className="flex mt-3 space-x-4">
                                        {businessInfo.socialMedia.map((social) => (
                                            <a
                                                key={social.name}
                                                href={social.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 transition-colors rounded-full bg-card hover:bg-primary/20"
                                                aria-label={`Follow us on ${social.name}`}
                                            >
                                                {social.icon}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Map Card */}
                        <Card className={cn(
                            "overflow-hidden backdrop-blur-sm border transition-all duration-300",
                            "bg-card/50 border-primary/10",
                            "dark:bg-card/30 dark:border-primary/20"
                        )}>
                            <div className="h-64 bg-muted">
                                <iframe
                                    title="House Edge Casino Location"
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108906.10649000479!2d-87.19739535913904!3d30.357925116116235!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8890b08d94ef7e6d%3A0x7a77e7eca34177ae!2sGulf%20Breeze%2C%20FL!5e0!3m2!1sen!2sus!4v1719288543397!5m2!1sen!2sus"
                                    width="100%"
                                    height="100%"
                                    className="border-0"
                                    allowFullScreen={false}
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                        </Card>
                    </motion.div>
                </div>

                {/* FAQ Section */}
                <motion.section
                    variants={itemVariants}
                    className="space-y-8"
                >
                    <div className="text-center">
                        <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
                        <p className="max-w-3xl mx-auto mt-4 text-lg text-muted-foreground">
                            Find quick answers to common questions about House Edge Casino Blackjack.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {faqItems.map((item) => (
                            <motion.div
                                key={item.question}
                                variants={itemVariants}
                                whileHover={{ scale: 1.02 }}
                            >
                                <Card className={cn(
                                    "p-6 backdrop-blur-sm border transition-all duration-300",
                                    "bg-card/50 border-primary/10 hover:border-primary/30",
                                    "dark:bg-card/30 dark:border-primary/20 dark:hover:border-primary/40"
                                )}>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xl">{item.question}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">{item.answer}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* CTA Section */}
                <motion.section
                    variants={itemVariants}
                    className="p-8 text-center border rounded-2xl bg-primary/5 backdrop-blur-sm border-primary/10"
                >
                    <h2 className="text-2xl font-bold">Ready for the Ultimate Blackjack Experience?</h2>
                    <p className="max-w-2xl mx-auto mt-4 mb-6 text-muted-foreground">
                        Join us at House Edge Casino for the finest blackjack tables in Gulf Breeze. Our professional dealers and elegant atmosphere await you.
                    </p>
                    <Button
                        className="px-8 py-6 text-lg text-black bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400"
                    >
                        Reserve a Table
                    </Button>
                </motion.section>
            </div>
        </motion.div>
    );
}