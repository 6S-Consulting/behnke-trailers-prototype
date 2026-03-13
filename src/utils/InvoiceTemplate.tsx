import React from "react";
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Link,
    Image,
} from "@react-pdf/renderer";

/* ======================================================
   TYPES (YOUR EXACT DATA MODEL)
====================================================== */

export interface InvoiceItem {
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
}

export interface InvoiceData {
    invoiceNumber: string;
    orderId: string;
    invoiceDate: string;
    paymentDate: string;
    paymentStatus: "Paid" | "Pending" | "Failed";
    transactionId: string;
    currency: string;

    customer: {
        name: string;
        email: string;
        billingAddress: string;
        shippingAddress: string;
        state: string;
        zip: string;
        country: string;
    };

    items: InvoiceItem[];

    pricing: {
        subtotal: number;
        discountCode: string;
        discountPercentOrAmount: string;
        discountTotal: number;
        taxableAmount: number;
        stateTaxRate: number;
        stateTaxAmount: number;
        shippingCost: number;
        totalPaid: number;
    };

    company: {
        legalName: string;
        address: string;
        taxId: string;
        supportEmail: string;
        returnPolicyUrl: string;
        disputeUrl: string;
        logo?: string;
    };

    paymentMethod: string;
}

/* ======================================================
   HELPERS
====================================================== */

const usd = (n: number) => `$${n.toFixed(2)}`;

/* ======================================================
   STYLES (E-COMMERCE INVOICE GRID)
====================================================== */

const styles = StyleSheet.create({
    page: {
        paddingTop: 36,
        paddingHorizontal: 36,
        paddingBottom: 120, // IMPORTANT → space for footer
        fontFamily: "Helvetica",
        fontSize: 10,
        color: "#111",
    },
colSerial: {
  width: "6%",
  textAlign: "center",
},
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    right: { textAlign: "right" },

    section: {
        marginTop: 18,
    },

    title: {
        fontSize: 22,
        fontWeight: "bold",
        alignItems: "flex-end",
    },

    meta: {
        lineHeight: 1.6,
        fontSize: 9,
    },

    box: {
        border: "1 solid #ccc",
        padding: 10,
    },

    sectionTitle: {
        fontSize: 11,
        fontWeight: "bold",
        marginBottom: 5,
    },

    /* TABLE */

    table: {
        border: "1 solid #000",
        marginTop: 10,
    },

    headerRow: {
        flexDirection: "row",
        borderBottom: "1 solid #000",
        backgroundColor: "#eee",
        paddingVertical: 6,
        fontWeight: "bold",
    },

    rowItem: {
        flexDirection: "row",
        borderBottom: "1 solid #ddd",
        paddingVertical: 6,
    },

    cell: { paddingHorizontal: 6 },
    tableRow: {
        flexDirection: "row",
        borderBottom: "1 solid #e5e7eb",
        paddingVertical: 6,
        alignItems: "center",
    },

    colProduct: {
        width: "40%",
        paddingRight: 6,
    },
    customerLeft: {
      width: "45%",
  alignItems: "flex-start",
    },

    colSku: {
        width: "18%",
        color: "#6b7280",
    },

    colQty: {
        width: "10%",
        textAlign: "center",
    },

    colPrice: {
        width: "16%",
        textAlign: "right",
    },
    colTotal: {
        width: "16%",
        textAlign: "right",

    },
    customerSection: {
        border: "1 solid #e5e7eb",
        marginBottom: 20,
    },

    customerRow: {
        flexDirection: "row",
    },

    leftInfo: {
        width: "40%",
        padding: 12,
        borderRight: "1 solid #e5e7eb",
    },

    addressWrapper: {
        width: "60%",
        alignItems: "flex-end",
    },

    addressRight: {
        width: "60%",
        alignItems: "flex-end",
    },

    addressBlock: {
        width: "85%",
    },
    addressCol: {
        width: "50%",
        padding: 12,
    },
    dividerSection: {
        marginTop: 18,
        paddingBottom: 12,
        borderBottom: "1 solid #d1d5db",
    },

    sectionLabel: {
        fontSize: 8,
        textTransform: "uppercase",
        color: "#6b7280",
        marginBottom: 6,
    },

    infoRow: {
        flexDirection: "row",
        marginBottom: 3,
    },

    infoKey: {
        color: "#6b7280", width: 110,
},

    infoValue: {
        fontWeight: "bold",
    },
    rightAlign: {
        textAlign: "right",
    },

    rightColumn: {
        alignItems: "flex-end",
        textAlign: "right",
    },
    /* SUMMARY */

    summaryWrap: {
        alignItems: "flex-end",
        marginTop: 16,
    },

    summaryBox: {
        width: 260,
        border: "1 solid #000",
        padding: 10,
    },

    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 2,
    },

    grandTotal: {
        borderTop: "1 solid #000",
        marginTop: 6,
        paddingTop: 6,
        fontSize: 12,
        fontWeight: "bold",
    },

    /* FOOTER */

    footer: {
        position: "absolute",
        bottom: 36,
        left: 36,
        right: 36,
        borderTop: "1 solid #000",
        paddingTop: 12,
    },
    footerCol: {
        width: "32%",
    },

    link: {
        color: "blue",
        textDecoration: "underline",
    },
    disclaimer: {
        fontSize: 7,
        color: "#6b7280",
        marginBottom: 10,
        lineHeight: 1.4,
        textAlign: "center",
        justifyContent: "center",
    },
});

/* ======================================================
   COMPONENT
====================================================== */

export const InvoiceDocument = ({ data }: { data: InvoiceData }) => {
    /* ---------- CALCULATIONS ---------- */

    const subtotal = data.items.reduce(
        (s, i) => s + i.quantity * i.unitPrice,
        0
    );

    const taxableAmount = subtotal - data.pricing.discountTotal;

    /* =================================================== */

    return (
        <Document>
            <Page size="A4" orientation="portrait" style={styles.page}>

                {/* ================= HEADER ================= */}

                {/* ================= HEADER ================= */}

                <View style={styles.row}>
                    {/* LEFT — COMPANY LOGO */}
                    <View>
                        {data.company.logo ? (
                            <View>
                                <Image
                                src={data.company.logo}
                                style={{ width: 180, height: 80, objectFit: "contain" }}
                            />
                            <Text style={{ fontSize: 18, fontWeight: "bold", fontStyle: "italic" }}>
                                {data.company.legalName || "Company Name"}
                            </Text>
                            </View>
                            
                        ) : (
                            <Text style={{ fontSize: 18, fontWeight: "bold", fontStyle: "italic" }}>
                                {data.company.legalName || "Company Name"}
                            </Text>
                        )}
                    </View>

                    {/* RIGHT — INVOICE META */}
                    <View style={[styles.rightColumn]}>
                        <Text style={[styles.title, styles.rightAlign]}>
                            INVOICE
                        </Text>

                        <View style={[styles.meta, styles.rightAlign]}>
                            <Text style={styles.rightAlign}>
                                Invoice Number: {data.invoiceNumber}
                            </Text>
                            <Text style={styles.rightAlign}>
                                Order ID: {data.orderId}
                            </Text>
                            <Text style={styles.rightAlign}>
                                Invoice Date: {data.invoiceDate}
                            </Text>
                            <Text style={styles.rightAlign}>
                                Payment Date: {data.paymentDate}
                            </Text>
                            <Text style={styles.rightAlign}>
                                Payment Status: {data.paymentStatus}
                            </Text>
                            <Text style={styles.rightAlign}>
                                Transaction ID: {data.transactionId}
                            </Text>
                            <Text style={styles.rightAlign}>
                                Currency: USD
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.dividerSection}>
                    <View style={styles.customerRow}>

                        {/* LEFT — CUSTOMER INFO */}
                        <View style={styles.customerLeft}>
                            <Text style={styles.sectionLabel}>Customer Information</Text>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoKey}>Customer</Text>
                                <Text style={styles.infoValue}>{data.customer.name}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoKey}>Email</Text>
                                <Text style={styles.infoValue}>{data.customer.email}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoKey}>Payment Status</Text>
                                <Text style={styles.infoValue}>{data.paymentStatus}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoKey}>Payment Method</Text>
                                <Text style={styles.infoValue}>{data.paymentMethod}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoKey}>Transaction</Text>
                                <Text style={styles.infoValue}>{data.transactionId}</Text>
                            </View>
                        </View>

                        {/* RIGHT — AMAZON STYLE ADDRESSES */}
                        <View style={styles.addressRight}>

                            {/* BILLING */}
                            <View style={styles.addressBlock}>
                                <Text style={[styles.sectionLabel, styles.rightAlign]}>
                                    Billing Address
                                </Text>

                                <Text style={styles.rightAlign}>
                                    {data.customer.billingAddress}
                                </Text>

                                <Text style={styles.rightAlign}>
                                    {data.customer.state}, {data.customer.zip}
                                </Text>

                                <Text style={styles.rightAlign}>
                                    {data.customer.country}
                                </Text>
                            </View>

                            {/* SHIPPING */}
                            <View style={styles.addressBlock}>
                                <Text style={[styles.sectionLabel, styles.rightAlign]}>
                                    Shipping Address
                                </Text>

                                <Text style={styles.rightAlign}>
                                    {data.customer.shippingAddress}
                                </Text>

                                <Text style={styles.rightAlign}>
                                    {data.customer.state}, {data.customer.zip}
                                </Text>

                                <Text style={styles.rightAlign}>
                                    {data.customer.country}
                                </Text>
                            </View>

                        </View>

                    </View>
                </View>

                {/* ================= ITEMS ================= */}

                <View style={[styles.section, styles.table]}>
                    <View style={styles.headerRow}>
  <Text style={[styles.cell, styles.colSerial]}>S.No</Text>

  <Text style={[styles.cell, styles.colProduct]}>
    Product Name
  </Text>

  <Text style={[styles.cell, styles.colSku]}>SKU</Text>

  <Text style={[styles.cell, styles.colQty]}>Qty</Text>

  <Text style={[styles.cell, styles.colPrice]}>
    Unit Price
  </Text>

  <Text style={[styles.cell, styles.colTotal]}>
    Line Total
  </Text>
</View>

                    {data.items.map((item, index) => (
                        <View key={index} style={styles.tableRow}>

  {/* S.NO */}
  <Text style={[styles.cell, styles.colSerial]}>
    {index + 1}
  </Text>

  <Text style={[styles.cell, styles.colProduct]}>
    {item.productName}
  </Text>

  <Text style={[styles.cell, styles.colSku]}>
    {item.sku}
  </Text>

  <Text style={[styles.cell, styles.colQty]}>
    {item.quantity}
  </Text>

  <Text style={[styles.cell, styles.colPrice]}>
    {usd(item.unitPrice)}
  </Text>

  <Text style={[styles.cell, styles.colTotal]}>
    {usd(item.quantity * item.unitPrice)}
  </Text>

</View>
))}
        
                </View>

                {/* ================= PRICING ================= */}

                <View style={styles.summaryWrap}>
                    <View style={styles.summaryBox}>
                        <View style={styles.summaryRow}>
                            <Text>Product Subtotal</Text>
                            <Text>{usd(subtotal)}</Text>
                        </View>

                        <View style={styles.summaryRow}>
                            <Text>
                                Discount ({data.pricing.discountCode} –
                                {data.pricing.discountPercentOrAmount})
                            </Text>
                            <Text>-{usd(data.pricing.discountTotal)}</Text>
                        </View>

                        <View style={styles.summaryRow}>
                            <Text>Taxable Amount</Text>
                            <Text>{usd(taxableAmount)}</Text>
                        </View>

                        <View style={styles.summaryRow}>
                            <Text>
                                State Tax (TX – {data.pricing.stateTaxRate}%)
                            </Text>
                            <Text>{usd(data.pricing.stateTaxAmount)}</Text>
                        </View>

                        <View style={styles.summaryRow}>
                            <Text>Shipping Cost</Text>
                            <Text>{usd(data.pricing.shippingCost)}</Text>
                        </View>

                        <View style={[styles.summaryRow, styles.grandTotal]}>
                            <Text>Total Paid (USD)</Text>
                            <Text>{usd(data.pricing.totalPaid)}</Text>
                        </View>
                    </View>
                </View>

                {/* ================= FOOTER ================= */}

                <View style={styles.footer} fixed>

                    <View>
                        {/* DISCLAIMER (TOP OF FOOTER) */}
                        <Text style={styles.disclaimer}>
                            This invoice is electronically generated and does not require a
                            physical signature. All sales are subject to the company’s terms
                            and conditions. Items purchased are eligible for return or dispute
                            only within the allowed policy window. Please retain this document
                            for your accounting records.
                        </Text>
                    </View>

                    {/* FOOTER COLUMNS */}
                    <View style={styles.row}>

                        {/* COMPANY */}
                        <View style={styles.footerCol}>
                            <Text>{data.company.legalName}</Text>
                            <Text>{data.company.address}</Text>
                            <Text>EIN / Tax ID: {data.company.taxId}</Text>
                        </View>

                        {/* SUPPORT */}
                        <View style={styles.footerCol}>
                            <Text>Support: {data.company.supportEmail}</Text>

                            <Link src={data.company.returnPolicyUrl} style={styles.link}>
                                Return Policy
                            </Link>

                            <Link src={data.company.disputeUrl} style={styles.link}>
                                Terms and Conditions
                            </Link>
                        </View>

                        {/* PAYMENT */}
                        <View style={styles.footerCol}>
                            <Text>Payment Method: {data.paymentMethod}</Text>
                            <Text>Transaction ID: {data.transactionId}</Text>
                            <Text>Status: {data.paymentStatus}</Text>
                        </View>

                    </View>
                </View>

            </Page>
        </Document>
    );
};