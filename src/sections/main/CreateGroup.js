import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Dialog, DialogContent, DialogTitle, Slide, Stack } from '@mui/material'
import React from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import FormProvider from '../../components/hook-form/FormProvider';
import { RHFTextField } from '../../components/hook-form';
import RHFAutocomplete from '../../components/hook-form/RHFAutocomplete';

const MEMBERS = ['Name 1', 'Name 2', 'Name 3' ];

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

const CreateGroupForm = ({handleClose}) =>{
  const NewGroupSchema = Yup.object().shape({
    title: Yup.string()
      .required('Title is required')
      .test('word-count', 'Title must be 12 words or fewer', (value = '') => {
        const words = value.trim().split(/\s+/).filter(Boolean);
        return words.length <= 12;
      }),
    members: Yup.array().min(2, 'Must have at least 2 members')
  });

  const defaultValues = {
    title:'',
    members:[]
  }

  const methods = useForm({
    resolver: yupResolver(NewGroupSchema),
    defaultValues
  });

  const { handleSubmit } = methods;

   const onSubmit = async (data) => {
    try {
      //api call
      console.log('Data',data);
    } catch (error) {
      console.log(error);
    }
   };

   return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <RHFTextField name='title' label='Title' inputProps={{ maxLength: 120 }} />
        <RHFAutocomplete name='members' label='Members' multiple freeSolo 
        options={MEMBERS.map((option) => option)} ChipProps={{size: 'medium'}}/>
        <Stack spacing={2} direction='row' alignItems='center' justifyContent='end'>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type='submit' variant='contained'>
            Create
          </Button>
        </Stack>
      </Stack>
    </FormProvider>
   )
};

const CreateGroup = ({open, handleClose}) => {
  return (
    <Dialog fullWidth maxWidth='xs' open={open} TransitionComponent={Transition} keepMounted sx={{p:4}}>
        {/* Title */}
        <DialogTitle sx={{mb:3}}>Create New Group</DialogTitle>
        {/* Content */}
        <DialogContent>
          {/* Form */}
          <CreateGroupForm handleClose/>
        </DialogContent>
    </Dialog>
  )
}

export default CreateGroup
