import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HomeEnfermeiro = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Essa é a home do Enfermeiro</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  text: {
    fontSize: 20,
    color: '#000000',
  },
});

export default HomeEnfermeiro;
