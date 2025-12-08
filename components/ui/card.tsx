import { Text, TextClassContext } from '@/components/ui/text';
import { View, type ViewProps } from 'react-native';

function Card({ ...props }: ViewProps & React.RefAttributes<View>) {
  return (
    <TextClassContext.Provider value="text-card-foreground">
      <View
        className=' '
        {...props}
      />
    </TextClassContext.Provider>
  );
}

function CardHeader({ ...props }: ViewProps & React.RefAttributes<View>) {
  return <View className='flex  flex-col gap-1.5 px-6' {...props} />;
}

function CardTitle({

  ...props
}: React.ComponentProps<typeof Text> & React.RefAttributes<Text>) {
  return (
    <Text
      role="heading"
      aria-level={3}
      className='font-semibold leading-none text-primary-foreground bg-red'
      {...props}
    />
  );
}

function CardDescription({

  ...props
}: React.ComponentProps<typeof Text> & React.RefAttributes<Text>) {
  return <Text className='text-muted-foreground text-sm' {...props} />;
}

function CardContent({ ...props }: ViewProps & React.RefAttributes<View>) {
  return <View className='px-6' {...props} />;
}

function CardFooter({ ...props }: ViewProps & React.RefAttributes<View>) {
  return <View className='flex flex-row items-center px-6 py-6' {...props} />;
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
