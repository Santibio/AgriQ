// components/pdf/SaleReceiptPDF.tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { SaleWithRelations } from './sales-list'
import { formatLongDate } from '@/lib/helpers/date'
import { FiscalCondition } from '@prisma/client'
import { capitalize } from '@/lib/utils'
import { convertToArgentinePeso } from '@/lib/helpers/number'

// ----- Constantes (copiadas de tu componente) -----
const PAYMENT_METHODS = {
  WIRE: 'Transferencia',
  CASH: 'Efectivo',
}

const FISCAL_CONDITIONS: Record<FiscalCondition, string> = {
  FINAL_CONSUMER: 'Consumidor Final',
  RESPONSIBLE: 'Responsable Inscripto',
  MONOTAX: 'Monotributista',
  EXEMPT: 'Exento',
}

// ----- Estilos para el PDF (similar a CSS-in-JS) -----
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  date: {
    fontSize: 10,
    color: '#666666',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#444444',
  },
  card: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 15,
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  textLabel: {
    fontSize: 11,
    color: '#555555',
  },
  textValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111111',
  },
  fiscalChip: {
    fontSize: 10,
    backgroundColor: '#E0E7FF',
    color: '#4338CA',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginTop: 5,
    alignSelf: 'flex-start',
  },
  productTable: {
    display: 'flex',
    width: 'auto',
  },
  productHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#AAAAAA',
    backgroundColor: '#F3F4F6',
    padding: 5,
    fontWeight: 'bold',
    fontSize: 10,
  },
  productRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    padding: 8,
  },
  colProduct: {
    width: '55%',
    fontSize: 11,
  },
  colQty: {
    width: '15%',
    fontSize: 11,
    textAlign: 'center',
  },
  colPrice: {
    width: '30%',
    fontSize: 11,
    textAlign: 'right',
  },
  totalsContainer: {
    marginTop: 20,
    marginLeft: 'auto',
    width: '50%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 11,
    color: '#333',
  },
  totalAmount: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
    marginVertical: 5,
  },
  grandTotal: {
    fontSize: 14,
    fontWeight: 'bold',
  },
})

// ----- Componente del Documento PDF -----
export function SaleReceiptPDF({ sale }: { sale: SaleWithRelations }) {
  return (
    <Document>
      <Page size='A4' style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Venta #{sale.id}</Text>
          <Text style={styles.date}>{formatLongDate(sale.createdAt)}</Text>
        </View>

        {/* Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <View style={styles.card}>
            <Text style={styles.textValue}>
              {sale.order.customer.name} {sale.order.customer.lastName}
            </Text>
            <Text style={styles.textLabel}>{sale.order.customer.phone}</Text>
            <Text style={styles.textLabel}>{sale.order.customer.email}</Text>
            <Text style={styles.fiscalChip}>
              {FISCAL_CONDITIONS[sale.order.customer.fiscalCondition]}
            </Text>
          </View>
        </View>

        {/* Cobro */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cobro</Text>
          <View style={styles.card}>
            <View style={styles.textRow}>
              <Text style={styles.textLabel}>Método:</Text>
              <Text style={styles.textValue}>
                {PAYMENT_METHODS[sale.paymentMethod]}
              </Text>
            </View>
          </View>
        </View>

        {/* Productos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Productos</Text>
          <View style={styles.card}>
            {/* Tabla Header */}
            <View style={styles.productHeader}>
              <Text style={styles.colProduct}>Producto</Text>
              <Text style={styles.colQty}>Cant.</Text>
              <Text style={styles.colPrice}>Total</Text>
            </View>

            {/* Lista de Productos */}
            {sale.order.details.map(item => (
              <View key={item.id} style={styles.productRow}>
                <View style={styles.colProduct}>
                  <Text style={{ fontWeight: 'bold' }}>
                    {capitalize(item.productName)}
                  </Text>
                </View>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <Text style={styles.colPrice}>
                  {convertToArgentinePeso(item.quantity * item.price)}
                </Text>
              </View>
            ))}

            {/* Totales */}
            <View style={styles.totalsContainer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalAmount}>
                  {convertToArgentinePeso(sale.subtotal)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Descuento</Text>
                <Text style={[styles.totalAmount, { color: '#DC2626' }]}>
                  -{convertToArgentinePeso(sale.discount)}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.grandTotal}>Total</Text>
                <Text style={[styles.grandTotal, { color: '#16A34A' }]}>
                  {convertToArgentinePeso(sale.total)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}
