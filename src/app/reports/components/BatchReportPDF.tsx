// src/components/reports/BatchReportPDF.tsx

import React from 'react'
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer'

// --- Interfaces ---
interface Product {
  name: string
}
interface Batch {
  id: number
  product: Product
  initialQuantity: number
  createdAt: string
}
interface PdfProps {
  batches: Batch[]
}

// --- Estilos para el PDF ---
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Helvetica-Bold',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: { flexDirection: 'row' },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f2f2f2',
    padding: 5,
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  headerText: { fontSize: 12, fontFamily: 'Helvetica-Bold' },
  cellText: { fontSize: 10 },
})

// --- Componente de la Plantilla PDF ---
const BatchReportPDF = ({ batches }: PdfProps) => (
  <Document>
    <Page size='A4' style={styles.page}>
      <Text style={styles.title}>Reporte de Lotes de Producción</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}>
            <Text style={styles.headerText}>ID Lote</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.headerText}>Producto</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.headerText}>Cantidad</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.headerText}>Fecha</Text>
          </View>
        </View>
        {batches.map(batch => (
          <View style={styles.tableRow} key={batch.id}>
            <View style={styles.tableCol}>
              <Text style={styles.cellText}>{batch.id}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.cellText}>{batch.product.name}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.cellText}>{batch.initialQuantity} u.</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.cellText}>{batch.createdAt}</Text>
            </View>
          </View>
        ))}
      </View>
    </Page>
  </Document>
)

export default BatchReportPDF
