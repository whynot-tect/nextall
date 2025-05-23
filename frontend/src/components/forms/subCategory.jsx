// File: C:\Users\hanos\nextall\frontend\src\components\forms\subCategory.jsx
'use client';
import React, { useState } from 'react';
import { useMutation } from 'react-query';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';
import { useRouter } from 'next-nprogress-bar';
// mui
import { styled } from '@mui/material/styles';
import { LoadingButton } from '@mui/lab';
import {
  Card,
  Stack,
  TextField,
  Typography,
  Box,
  Select,
  FormControl,
  FormHelperText,
  Grid,
  Skeleton
} from '@mui/material';
// components
import UploadSingleFile from 'src/components/upload/UploadSingleFile';
// yup
import * as Yup from 'yup';
// axios
import axios from 'axios';
// formik
import { Form, FormikProvider, useFormik } from 'formik';
// api
import * as api from 'src/services';

SubCategoryForm.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
      // ... add other required properties for category
    })
  ).isRequired,
  data: PropTypes.object,
  isLoading: PropTypes.bool,
  isInitialized: PropTypes.bool
};

const LabelStyle = styled(Typography)(({ theme }) => ({
  ...theme.typography.subtitle2,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
  lineHeight: 2.5
}));

const STATUS_OPTIONS = ['active', 'deactive'];

export default function SubCategoryForm({
  data: currentCategory,
  categories,
  isLoading: categoryLoading,
  isInitialized = false
}) {
  const router = useRouter();

  const [state, setstate] = useState({
    loading: false,
    name: '',
    search: '',
    open: false
  });

  const { mutate, isLoading } = useMutation(
    currentCategory ? 'update' : 'new',
    currentCategory ? api.updateSubCategoryByAdmin : api.addSubCategoryByAdmin,
    {
      ...(currentCategory && {
        enabled: Boolean(currentCategory)
      }),
      retry: false,
      onSuccess: (data) => {
        toast.success(data.message);
        router.push('/admin/sub-categories');
      },
      onError: (error) => {
        toast.error(error.response.data.message);
      }
    }
  );

  const { mutate: deleteMutate } = useMutation(api.singleDeleteFile, {
    onError: (error) => {
      toast.error(error.response.data.message);
    }
  });

  const NewCategorySchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    cover: Yup.mixed().required('Cover is required'),
    slug: Yup.string().required('Slug is required'),
    description: Yup.string().required('Description is required'),
    metaTitle: Yup.string().required('Meta title is required'),
    metaDescription: Yup.string().required('Meta description is required'),
    parentCategory: Yup.string().required('Category is required')
  });

  const formik = useFormik({
    initialValues: {
      name: currentCategory?.name || '',
      metaTitle: currentCategory?.metaTitle || '',
      cover: currentCategory?.cover || null,
      description: currentCategory?.description || '',
      metaDescription: currentCategory?.metaDescription || '',
      file: currentCategory?.cover || '',
      slug: currentCategory?.slug || '',
      status: currentCategory?.status || STATUS_OPTIONS[0],
      parentCategory:
        currentCategory?.category || (categories && categories[0]?._id) || ''
    },
    enableReinitialize: true,
    validationSchema: NewCategorySchema,
    onSubmit: async (values) => {
      const { ...rest } = values;
      try {
        mutate({
          ...rest,
          ...(currentCategory && {
            currentSlug: currentCategory.slug
          })
        });
      } catch (error) {
        console.error(error);
      }
    }
  });

  const { errors, values, touched, handleSubmit, setFieldValue, getFieldProps } =
    formik;

  const handleDrop = async (acceptedFiles) => {
    setstate({ ...state, loading: 2 });
    const file = acceptedFiles[0];
    if (file) {
      Object.assign(file, {
        preview: URL.createObjectURL(file)
      });
    }
    setFieldValue('file', file);
    const formData = new FormData();
    formData.append('file', file);
    // Remove Cloudinary-specific data and call your backend upload endpoint
    const config = {
      onUploadProgress: (progressEvent) => {
        const { loaded, total } = progressEvent;
        const percentage = Math.floor((loaded * 100) / total);
        setstate({ ...state, loading: percentage });
      }
    };
    await axios
      .post(`/api/upload`, formData, config)
      .then(({ data }) => {
        // Expecting data.key and data.url from your backend that uploads to Cloudflare R2
        setFieldValue('cover', {
          _id: data.key,
          url: data.url
        });
        setstate({ ...state, loading: false });
      })
      .then(() => {
        if (values.cover) {
          deleteMutate(values.cover._id);
        }
        setstate({ ...state, loading: false });
      })
      .catch((error) => {
        toast.error('Upload failed');
        setstate({ ...state, loading: false });
      });
  };

  const handleTitleChange = (event) => {
    const title = event.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]+/g, '')
      .replace(/\s+/g, '-');
    formik.setFieldValue('slug', slug);
    formik.handleChange(event);
  };

  return (
    <Box position="relative">
      <FormikProvider value={formik}>
        <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <div>
                    {categoryLoading ? (
                      <Skeleton variant="text" width={140} />
                    ) : (
                      <LabelStyle
                        component={'label'}
                        htmlFor="category-name"
                      >
                        Category Name
                      </LabelStyle>
                    )}
                    {categoryLoading ? (
                      <Skeleton variant="rectangular" width="100%" height={56} />
                    ) : (
                      <TextField
                        id="category-name"
                        fullWidth
                        {...getFieldProps('name')}
                        onChange={handleTitleChange}
                        error={Boolean(touched.name && errors.name)}
                        helperText={touched.name && errors.name}
                      />
                    )}
                  </div>
                  <div>
                    {categoryLoading ? (
                      <Skeleton variant="text" width={100} />
                    ) : (
                      <LabelStyle
                        component={'label'}
                        htmlFor="meta-title"
                      >
                        Meta Title
                      </LabelStyle>
                    )}
                    {categoryLoading ? (
                      <Skeleton variant="rectangular" width="100%" height={56} />
                    ) : (
                      <TextField
                        id="meta-title"
                        fullWidth
                        {...getFieldProps('metaTitle')}
                        error={Boolean(touched.metaTitle && errors.metaTitle)}
                        helperText={touched.metaTitle && errors.metaTitle}
                      />
                    )}
                  </div>
                  <div>
                    <FormControl fullWidth>
                      {isInitialized ? (
                        <Skeleton variant="text" width={100} />
                      ) : (
                        <LabelStyle
                          component={'label'}
                          htmlFor="grouped-native-select"
                        >
                          Category
                        </LabelStyle>
                      )}
                      {!categoryLoading ? (
                        <Select
                          native
                          {...getFieldProps('parentCategory')}
                          value={values.parentCategory}
                          id="grouped-native-select"
                        >
                          {categories?.map((category) => (
                            <option key={category._id} value={category._id}>
                              {category.name}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <Skeleton
                          variant="rectangular"
                          width={'100%'}
                          height={56}
                        />
                      )}
                      {touched.parentCategory && errors.parentCategory && (
                        <FormHelperText error sx={{ px: 2, mx: 0 }}>
                          {touched.parentCategory && errors.parentCategory}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </div>
                  <div>
                    {categoryLoading ? (
                      <Skeleton variant="text" width={70} />
                    ) : (
                      <LabelStyle component={'label'} htmlFor="slug">
                        Slug
                      </LabelStyle>
                    )}
                    {categoryLoading ? (
                      <Skeleton variant="rectangular" width="100%" height={56} />
                    ) : (
                      <TextField
                        fullWidth
                        id="slug"
                        {...getFieldProps('slug')}
                        error={Boolean(touched.slug && errors.slug)}
                        helperText={touched.slug && errors.slug}
                      />
                    )}
                  </div>
                  <div>
                    {categoryLoading ? (
                      <Skeleton variant="text" width={100} />
                    ) : (
                      <LabelStyle
                        component={'label'}
                        htmlFor="description"
                      >
                        Description
                      </LabelStyle>
                    )}
                    {categoryLoading ? (
                      <Skeleton
                        variant="rectangular"
                        width="100%"
                        height={240}
                      />
                    ) : (
                      <TextField
                        fullWidth
                        id="description"
                        {...getFieldProps('description')}
                        error={Boolean(touched.description && errors.description)}
                        helperText={touched.description && errors.description}
                        rows={9}
                        multiline
                      />
                    )}
                  </div>
                </Stack>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <div
                style={{
                  position: '-webkit-sticky',
                  position: 'sticky',
                  top: 0
                }}
              >
                <Stack spacing={3}>
                  <Card sx={{ p: 3 }}>
                    <Stack spacing={3}>
                      <div>
                        {categoryLoading ? (
                          <Skeleton variant="text" width={150} />
                        ) : (
                          <LabelStyle
                            component={'label'}
                            htmlFor="meta-description"
                          >
                            Meta Description
                          </LabelStyle>
                        )}
                        {categoryLoading ? (
                          <Skeleton
                            variant="rectangular"
                            width="100%"
                            height={240}
                          />
                        ) : (
                          <TextField
                            id="meta-description"
                            fullWidth
                            {...getFieldProps('metaDescription')}
                            error={Boolean(
                              touched.metaDescription && errors.metaDescription
                            )}
                            helperText={
                              touched.metaDescription && errors.metaDescription
                            }
                            rows={9}
                            multiline
                          />
                        )}
                      </div>

                      <div>
                        <Stack direction="row" justifyContent="space-between">
                          {categoryLoading ? (
                            <Skeleton variant="text" width={150} />
                          ) : (
                            <LabelStyle
                              variant="body1"
                              component={'label'}
                              color="text.primary"
                            >
                              Image
                            </LabelStyle>
                          )}
                          {categoryLoading ? (
                            <Skeleton variant="text" width={150} />
                          ) : (
                            <LabelStyle component={'label'} htmlFor="file">
                              <span>512 * 512</span>
                            </LabelStyle>
                          )}
                        </Stack>
                        {categoryLoading ? (
                          <Skeleton
                            variant="rectangular"
                            width="100%"
                            height={225}
                          />
                        ) : (
                          <UploadSingleFile
                            id="file"
                            file={values.cover}
                            onDrop={handleDrop}
                            error={Boolean(touched.cover && errors.cover)}
                            category
                            accept="image/*"
                            loading={state.loading}
                          />
                        )}
                        {touched.cover && errors.cover && (
                          <FormHelperText error sx={{ px: 2, mx: 0 }}>
                            {touched.cover && errors.cover}
                          </FormHelperText>
                        )}
                      </div>
                      <FormControl fullWidth sx={{ select: { textTransform: 'capitalize' } }}>
                        {categoryLoading ? (
                          <Skeleton variant="text" width={70} />
                        ) : (
                          <LabelStyle component={'label'} htmlFor="status">
                            Status
                          </LabelStyle>
                        )}
                        {categoryLoading ? (
                          <Skeleton variant="rectangular" width="100%" height={56} />
                        ) : (
                          <Select
                            id="status"
                            native
                            {...getFieldProps('status')}
                            error={Boolean(touched.status && errors.status)}
                          >
                            <option value="" style={{ display: 'none' }} />
                            {STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </Select>
                        )}
                        {touched.status && errors.status && (
                          <FormHelperText error sx={{ px: 2, mx: 0 }}>
                            {touched.status && errors.status}
                          </FormHelperText>
                        )}
                      </FormControl>
                    </Stack>
                  </Card>
                  {categoryLoading ? (
                    <Skeleton variant="rectangular" width="100%" height={56} />
                  ) : (
                    <LoadingButton
                      type="submit"
                      variant="contained"
                      size="large"
                      loading={isLoading}
                      sx={{ ml: 'auto', mt: 3 }}
                    >
                      {currentCategory ? 'Edit Sub Category' : 'Create Sub Category'}
                    </LoadingButton>
                  )}
                </Stack>
              </div>
            </Grid>
          </Grid>
        </Form>
      </FormikProvider>
    </Box>
  );
}
