export interface Theme {
  value: string;
  label: string;
  icon: string;
}

export const themes: Theme[] = [
  { value: 'academia', label: 'Academia', icon: '💪' },
  { value: 'comida', label: 'Culinária', icon: '🍳' },
  { value: 'viagem', label: 'Viagem', icon: '✈️' },
  { value: 'moda', label: 'Moda', icon: '👗' },
  { value: 'tecnologia', label: 'Tecnologia', icon: '💻' },
  { value: 'negocios', label: 'Negócios', icon: '📈' },
];