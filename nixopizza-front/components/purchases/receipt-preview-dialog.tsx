// components/purchase/receipt-preview-dialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Printer, Download, Package, Building2 } from "lucide-react";
import { IOrder } from "@/app/dashboard/purchases/page";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Font,
} from "@react-pdf/renderer";

// Register a font (optional)
Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
});

interface ReceiptPreviewDialogProps {
  order: IOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  orderNumber: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  detailColumn: {
    width: "45%",
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  detailItem: {
    flexDirection: "row",
    marginBottom: 3,
  },
  detailLabel: {
    width: 80,
    fontWeight: "bold",
  },
  detailValue: {
    flex: 1,
  },
  table: {
    display: "flex",
    width: "auto",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
  },
  tableCell: {
    padding: 8,
    width: "25%",
  },
  tableCellLeft: {
    padding: 8,
    width: "40%",
  },
  tableCellRight: {
    padding: 8,
    width: "15%",
    textAlign: "right",
  },
  totalSection: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  totalText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 10,
    color: "#666",
  },
});

// PDF Document Component
const ReceiptPDF = ({ order }: { order: IOrder }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.header}>Purchase Order</Text>
        <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailColumn}>
          <Text style={styles.detailTitle}>
            <Text style={{ marginRight: 5 }}>
              <Package size={10} />
            </Text>
            Order Information
          </Text>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Order ID:</Text>
            <Text style={styles.detailValue}>{order.orderNumber}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>
              {new Date(order.createdAt).toLocaleDateString("en-GB")}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={styles.detailValue}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.detailColumn}>
          <Text style={styles.detailTitle}>
            <Text style={{ marginRight: 5 }}>
              <Building2 size={10} />
            </Text>
            Supplier Information
          </Text>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Company:</Text>
            <Text style={styles.detailValue}>{order.supplierId?.name}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Contact:</Text>
            <Text style={styles.detailValue}>
              {order.supplierId?.contactPerson}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Email:</Text>
            <Text style={styles.detailValue}>{order.supplierId?.email}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Phone:</Text>
            <Text style={styles.detailValue}>{order.supplierId?.phone}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.detailTitle}>
          <Text style={{ marginRight: 5 }}>
            <Package size={10} />
          </Text>
          Order Items
        </Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellLeft}>Item</Text>
            <Text style={styles.tableCellRight}>Qty</Text>
            <Text style={styles.tableCellRight}>Unit Price</Text>
            <Text style={styles.tableCellRight}>Total</Text>
          </View>
          {order.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCellLeft}>
                {item.productId?.name}
                {"\n"}BARCODE: {item.productId?.barcode}
              </Text>
              <Text style={styles.tableCellRight}>{item.quantity}</Text>
              <Text style={styles.tableCellRight}>
                {item.unitCost.toFixed(2)} DA
              </Text>
              <Text style={styles.tableCellRight}>
                {(item.unitCost * item.quantity).toFixed(2)} DA
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.totalSection}>
        <Text style={styles.totalText}>
          Total: {order.totalAmount.toFixed(2)} DA
        </Text>
      </View>

      <Text style={styles.footer}>
        Thank you for your business! Generated on{" "}
        {new Date().toLocaleDateString()}
      </Text>
    </Page>
  </Document>
);

export function ReceiptPreviewDialog({
  order,
  open,
  onOpenChange,
}: ReceiptPreviewDialogProps) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto print:max-w-none print:max-h-none print:m-0 print:p-0">
        <DialogHeader className="print:hidden">
          <DialogTitle className="font-heading text-xl">
            Purchase Order Receipt
          </DialogTitle>
          <DialogDescription className="sr-only">
            Preview of purchase order receipt for download or printing
          </DialogDescription>
        </DialogHeader>

        <div
          className="space-y-6 print:space-y-4 print:text-black print:bg-white print:p-8 print:shadow-none"
          id="receipt-content"
        >
          {/* Header */}
          <div className="text-center space-y-2 print:space-y-1">
            <h1 className="text-2xl font-bold font-heading print:text-xl">
              Purchase Order
            </h1>
            <p className="text-muted-foreground print:text-sm">
              Order #{order?.orderNumber}
            </p>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-1 print:gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-heading font-semibold print:text-sm">
                <Package className="h-4 w-4" />
                <h3>Order Information</h3>
              </div>
              <div className="text-sm space-y-1 print:text-xs">
                <p className="flex">
                  <span className="font-medium w-24">Order ID:</span>
                  <span>{order?.orderNumber}</span>
                </p>
                <p className="flex">
                  <span className="font-medium w-24">Date:</span>
                  <span>
                    {new Date(order?.createdAt).toLocaleDateString("en-GB")}
                  </span>
                </p>
                <p className="flex">
                  <span className="font-medium w-24">Status:</span>
                  <span
                    className={`font-semibold ${
                      order.status === "paid"
                        ? "text-green-600"
                        : order.status === "pending"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-heading font-semibold print:text-sm">
                <Building2 className="h-4 w-4" />
                <h3>Supplier Information</h3>
              </div>
              <div className="text-sm space-y-1 print:text-xs">
                <p className="flex">
                  <span className="font-medium w-24">Company:</span>
                  <span>{order?.supplierId?.name}</span>
                </p>
                <p className="flex">
                  <span className="font-medium w-24">Contact:</span>
                  <span>{order?.supplierId?.contactPerson}</span>
                </p>
                <p className="flex">
                  <span className="font-medium w-24">Email:</span>
                  <span>{order?.supplierId?.email}</span>
                </p>
                <p className="flex">
                  <span className="font-medium w-24">Phone:</span>
                  <span>{order?.supplierId?.phone}</span>
                </p>
              </div>
            </div>
          </div>

          <Separator className="print:my-2" />

          {/* Items Table */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-heading font-semibold print:text-sm">
              <Package className="h-4 w-4" />
              <h3>Order Items</h3>
            </div>
            <div className="border rounded-lg overflow-hidden print:border print:rounded-none">
              <table className="w-full print:table-auto">
                <thead className="bg-muted print:bg-gray-100">
                  <tr>
                    <th className="text-left p-3 font-medium print:text-xs print:p-1">
                      Item
                    </th>
                    <th className="text-right p-3 font-medium print:text-xs print:p-1">
                      Qty
                    </th>
                    <th className="text-right p-3 font-medium print:text-xs print:p-1">
                      Unit Price
                    </th>
                    <th className="text-right p-3 font-medium print:text-xs print:p-1">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr
                      key={index}
                      className="border-t print:border-t print:border-gray-200"
                    >
                      <td className="p-3 print:p-1">
                        <div className="font-medium print:text-xs">
                          {item.productId?.name}
                        </div>
                        <div className="text-sm text-muted-foreground print:text-[10px]">
                          BARCODE: {item.productId?.barcode}
                        </div>
                      </td>
                      <td className="p-3 text-right print:p-1 print:text-xs">
                        {item.quantity}
                      </td>
                      <td className="p-3 text-right print:p-1 print:text-xs">
                        {item.unitCost.toFixed(2)} DA
                      </td>
                      <td className="p-3 text-right font-medium print:p-1 print:text-xs print:font-semibold">
                        {(item.unitCost * item.quantity).toFixed(2)} DA
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Separator className="print:my-2" />

          {/* Totals */}
          <div className="space-y-2 print:space-y-1">
            <div className="flex justify-between text-xl font-bold print:text-lg">
              <span>Total:</span>
              <span className="text-primary">
                {order.totalAmount.toFixed(2)} DA
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground pt-4 border-t print:border-t print:border-gray-200 print:pt-2">
            <p className="print:text-xs">Thank you for your business!</p>
            <p className="print:text-xs">
              Generated on {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Action Buttons - Hidden when printing */}
        <div className="flex gap-2 pt-4 print:hidden">
          <Button onClick={handlePrint} className="flex-1 gap-2">
            <Printer className="h-4 w-4" />
            Print Receipt
          </Button>
          <PDFDownloadLink
            document={<ReceiptPDF order={order} />}
            fileName={`purchase-order-${order.orderNumber}.pdf`}
            className="w-full"
          >
            {({ loading }) => (
              <Button
                variant="outline"
                className="flex-1 gap-2"
                disabled={loading}
              >
                <Download className="h-4 w-4" />
                {loading ? "Generating..." : "Download PDF"}
              </Button>
            )}
          </PDFDownloadLink>
        </div>
      </DialogContent>
    </Dialog>
  );
}
