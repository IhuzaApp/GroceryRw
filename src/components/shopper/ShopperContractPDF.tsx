import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 50,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    borderBottomWidth: 2,
    borderBottomColor: '#00D9A5',
    paddingBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
  },
  titleContainer: {
    textAlign: 'right',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subTitle: {
    fontSize: 10,
    color: '#666666',
    marginTop: 5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#00D9A5',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    width: 140,
    fontSize: 10,
    color: '#666666',
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
    fontSize: 10,
    color: '#1a1a1a',
  },
  content: {
    fontSize: 9,
    lineHeight: 1.6,
    color: '#333333',
    textAlign: 'justify',
    marginBottom: 15,
  },
  signatureContainer: {
    flexDirection: 'row',
    marginTop: 50,
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '45%',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
    alignItems: 'center',
  },
  signatureImage: {
    width: 120,
    height: 60,
    marginBottom: 10,
    objectFit: 'contain',
  },
  signatureLabel: {
    fontSize: 9,
    color: '#999999',
    textTransform: 'uppercase',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 8,
    color: '#999999',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  }
});

interface ShopperContractPDFProps {
  data: any;
  date: string;
}

export const ShopperContractPDF = ({ data, date }: ShopperContractPDFProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src="/assets/logos/PlasLogoPNG.png" style={styles.logo} />
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>Shopper Agreement</Text>
            <Text style={styles.subTitle}>Plas Business Network</Text>
          </View>
        </View>

        {/* Personal Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Independent Contractor Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Full Name:</Text>
            <Text style={styles.value}>{data.full_name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email Address:</Text>
            <Text style={styles.value}>{data.email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phone Number:</Text>
            <Text style={styles.value}>{data.phone_number}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>National ID / Passport:</Text>
            <Text style={styles.value}>{data.national_id}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date of Birth:</Text>
            <Text style={styles.value}>{data.dob}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Residential Address:</Text>
            <Text style={styles.value}>{data.address}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Transport Mode:</Text>
            <Text style={styles.value}>{data.transport_mode}</Text>
          </View>
        </View>

        {/* Guarantor Details */}
        {data.guarantor && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Guarantor Reference</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{data.guarantor}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Contact:</Text>
              <Text style={styles.value}>{data.guarantorPhone}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Relationship:</Text>
              <Text style={styles.value}>{data.guarantorRelationship}</Text>
            </View>
          </View>
        )}

        {/* Terms and Conditions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Terms of Engagement</Text>
          <Text style={styles.content}>
            By signing this agreement, the Independent Contractor (the "Shopper") agrees to represent Plas Business (the "Company") in a professional manner. The Shopper acknowledges that they are an independent contractor and not an employee of the Company. The Shopper is responsible for their own transportation, insurance, and equipment necessary to perform delivery services.
          </Text>
          <Text style={styles.content}>
            The Shopper agrees to adhere to the Company's quality standards, safety protocols, and delivery timeliness. The Shopper certifies that all information provided during the registration process, including the uploaded documents (National ID, Police Clearance, etc.), is accurate and authentic.
          </Text>
        </View>

        {/* Signatures */}
        <View style={styles.signatureContainer}>
          <View style={styles.signatureBox}>
            {data.signature && (
              <Image src={data.signature} style={styles.signatureImage} />
            )}
            <Text style={styles.value}>{data.full_name}</Text>
            <Text style={styles.signatureLabel}>Shopper Digital Signature</Text>
          </View>
          <View style={styles.signatureBox}>
            <Image src="/assets/logos/PlasLogoPNG.png" style={styles.signatureImage} />
            <Text style={styles.value}>Plas Support Team</Text>
            <Text style={styles.signatureLabel}>Authorized Representative</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Signed on {date} • Plas Business Network • Rwanda • onboarding@plas.rw</Text>
        </View>
      </Page>
    </Document>
  );
};
