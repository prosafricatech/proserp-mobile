import { yupResolver } from '@hookform/resolvers/yup';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Checkbox, Divider, Snackbar, Text } from 'react-native-paper';
import * as yup from 'yup';
import { getErrorMessage } from '../../api/client';
import type { PickedFile } from '../../api/upload';
import { useAuth } from '../../auth/AuthProvider';
import { applyServerErrors } from '../../auth/serverErrors';
import type { Organization } from '../../auth/types';
import { FormMessage } from '../../components/auth/AuthLinks';
import GradientButton from '../../components/auth/GradientButton';
import { EmptyState, ErrorState, Loading } from '../../components/common/ScreenState';
import ColorField from '../../components/form/ColorField';
import DateField from '../../components/form/DateField';
import ImageField from '../../components/form/ImageField';
import SelectField, { type SelectOption } from '../../components/form/SelectField';
import TextField from '../../components/form/TextField';
import { COUNTRIES } from '../../constants/countries';
import { MODULES } from '../../constants/modules';
import { PERMISSIONS } from '../../constants/permissions';
import { PROS_CONTROL_PERMISSIONS } from '../../constants/prosControlPermissions';
import { dictionary } from '../../i18n';
import { organizationsApi, type OrganizationValues } from '../../modules/organizations/api';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import { darkPalette, fonts, lightPalette } from '../../theme/palette';
import { useAppTheme } from '../../theme/ThemeProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'OrganizationForm'>;

const t = dictionary.organizationForm;
const e = t.errors;
const HEX = /^#([0-9A-Fa-f]{3}){1,2}$/;
const optionalNumber = (test: (n: number) => boolean, message: string) =>
  yup
    .string()
    .nullable()
    .default('')
    .test('n', message, (v) => !v || (Number.isFinite(Number(v)) && test(Number(v))));

// Same rules as live-repo src/components/organizations/form/OrganizationForm.tsx. Number fields
// are kept as strings while typing (TextInput gives strings) and converted on submit.
const schema = yup.object({
  name: yup.string().trim().required(e.nameRequired).min(3, e.nameMin).max(100, e.nameMax),
  email: yup.string().trim().email(e.emailInvalid).nullable().default(''),
  phone: yup
    .string()
    .trim()
    .required(e.phoneRequired)
    .matches(/^\+?[0-9]{10,15}$/, e.phoneInvalid),
  tin: yup.string().trim().nullable().default(''),
  recording_start_date: yup.string().required(e.recordingStartRequired),
  address: yup.string().trim().nullable().default(''),
  website: yup
    .string()
    .trim()
    .matches(
      /^$|((https?):\/\/)?(www\.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
      e.websiteInvalid
    )
    .nullable()
    .default(''),
  country_code: yup.string().required(e.countryRequired),
  currency_code: yup.string().required(e.currencyRequired),
  vat_registered: yup.boolean().default(false),
  vrn: yup
    .string()
    .trim()
    .when('vat_registered', {
      is: true,
      then: (s) => s.required(e.vrnRequired),
      otherwise: (s) => s.nullable(),
    })
    .default(''),
  vat_percentage: yup
    .string()
    .when('vat_registered', {
      is: true,
      then: (s) =>
        s
          .required(e.vatRequired)
          .test('range', e.vatRange, (v) => Number(v) > 0 && Number(v) <= 100),
      otherwise: (s) => s.nullable(),
    })
    .default('18'),
  defer_grn_billing: yup.boolean().default(false),
  defer_project_certificate_invoicing: yup.boolean().default(false),
  generate_invoices_for_project_certificates: yup.boolean().default(false),
  standard_hours_per_month: optionalNumber((n) => n > 0, e.hoursInvalid),
  employee_number_prefix: yup.string().trim().max(20, e.prefixMax).nullable().default(''),
  employee_number_padding: optionalNumber((n) => n >= 1 && n <= 10, e.digitsRange),
  main_color: yup.string().required(e.colorInvalid).matches(HEX, e.colorInvalid),
  light_color: yup.string().required(e.colorInvalid).matches(HEX, e.colorInvalid),
  dark_color: yup.string().required(e.colorInvalid).matches(HEX, e.colorInvalid),
  contrast_text: yup.string().required(e.colorInvalid).matches(HEX, e.colorInvalid),
  tagline: yup.string().trim().max(50, e.taglineMax).nullable().default(''),
  logo: yup.mixed<PickedFile>().nullable().default(null),
  organization_symbol: yup.mixed<PickedFile>().nullable().default(null),
});

type Values = yup.InferType<typeof schema>;
const FIELDS = Object.keys(schema.fields) as (keyof Values)[];

const countryOptions: SelectOption[] = COUNTRIES.map((c) => ({
  value: c.code,
  label: c.name,
  description: c.dialCode,
}));
const currencyOptions: SelectOption[] = Array.from(
  new Map(COUNTRIES.map((c) => [c.currency.code, c.currency])).values()
)
  .sort((a, b) => a.code.localeCompare(b.code))
  .map((c) => ({ value: c.code, label: `${c.code} — ${c.name}`, description: c.symbol }));

const str = (v: unknown) => (v === null || v === undefined ? '' : String(v));

// Default values exactly as the web form builds them (new or from an existing organization).
const toFormValues = (org: Organization | null, isDark: boolean): Values => {
  const theme = isDark ? darkPalette : lightPalette;
  const settings = org?.settings ?? {};
  return {
    name: org?.name ?? '',
    email: str(org?.email),
    phone: str(org?.phone),
    tin: str(org?.tin),
    recording_start_date: str(org?.recording_start_date),
    address: str(org?.address),
    website: str(org?.website),
    country_code: str(org?.country_code),
    currency_code: str(
      org?.base_currency?.code ?? COUNTRIES.find((c) => c.code === org?.country_code)?.currency.code
    ),
    vat_registered: !!settings.vat_registered,
    vrn: str(settings.vrn),
    vat_percentage: str(settings.vat_percentage || 18),
    defer_grn_billing: !!settings.defer_grn_billing,
    defer_project_certificate_invoicing: !!settings.defer_project_certificate_invoicing,
    generate_invoices_for_project_certificates:
      !!settings.generate_invoices_for_project_certificates,
    standard_hours_per_month: str(settings.standard_hours_per_month),
    employee_number_prefix: str(settings.employee_number_prefix),
    employee_number_padding: str(settings.employee_number_padding),
    main_color: settings.main_color || theme.primary,
    light_color: settings.light_color || '#bec5da',
    dark_color: settings.dark_color || (isDark ? '#5E3BB7' : '#473bb7'),
    contrast_text: settings.contrast_text || theme.primaryContrast,
    tagline: str(settings.tagline),
    logo: null,
    organization_symbol: null,
  };
};

const toPayload = (v: Values, org: Organization | null): OrganizationValues => {
  const orNull = (x?: string | null) => (x ? x : null);
  const num = (x?: string | null) => (x ? Number(x) : null);
  return {
    id: org?.id,
    name: v.name,
    email: orNull(v.email),
    phone: v.phone,
    tin: orNull(v.tin),
    recording_start_date: v.recording_start_date,
    address: orNull(v.address),
    website: orNull(v.website),
    country_code: v.country_code,
    currency_code: v.currency_code,
    vat_registered: !!v.vat_registered,
    vrn: v.vat_registered ? orNull(v.vrn) : null,
    vat_percentage: num(v.vat_percentage),
    defer_grn_billing: !!v.defer_grn_billing,
    defer_project_certificate_invoicing: !!v.defer_project_certificate_invoicing,
    generate_invoices_for_project_certificates: !!v.generate_invoices_for_project_certificates,
    standard_hours_per_month: num(v.standard_hours_per_month),
    employee_number_prefix: orNull(v.employee_number_prefix),
    employee_number_padding: num(v.employee_number_padding),
    symbol_path: org?.settings?.symbol_path ?? null,
    main_color: v.main_color,
    light_color: v.light_color,
    dark_color: v.dark_color,
    contrast_text: v.contrast_text,
    tagline: orNull(v.tagline),
    logo: v.logo ?? null,
    organization_symbol: v.organization_symbol ?? null,
  };
};

// Port of live-repo OrganizationForm.tsx (create) + EditOrganization.tsx (edit), every field.
export default function OrganizationFormScreen({ navigation, route }: Props) {
  const organizationId = route.params?.organizationId;
  const { checkPermission, checkOrganizationPermission } = useAuth();
  const { isDark } = useAppTheme();

  const canManage = checkPermission(PROS_CONTROL_PERMISSIONS.ORGANIZATIONS_MANAGE);
  const canEdit =
    canManage || (!!organizationId && checkOrganizationPermission(PERMISSIONS.ORGANIZATION_UPDATE));

  const details = useQuery({
    queryKey: ['organizationDetails', organizationId],
    queryFn: () => organizationsApi.details(organizationId!),
    enabled: !!organizationId && canEdit,
  });

  // Web sends users without permission back to the dashboard; here we say why.
  if (!canEdit) return <EmptyState message={t.unauthorized} />;
  if (organizationId && details.isLoading) return <Loading />;
  if (organizationId && details.isError)
    return <ErrorState error={details.error} onRetry={() => details.refetch()} />;

  const organization = details.data ?? null;
  return (
    <OrganizationForm
      key={organization?.id ?? 'new'}
      organization={organization}
      defaults={toFormValues(organization, isDark)}
      onDone={() => (navigation.canGoBack() ? navigation.goBack() : undefined)}
    />
  );
}

function OrganizationForm({
  organization,
  defaults,
  onDone,
}: {
  organization: Organization | null;
  defaults: Values;
  onDone: () => void;
}) {
  const { adoptOrganization, loadOrganization, refreshAuth, organizationHasSubscribed } = useAuth();
  const { palette } = useAppTheme();
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<Values>({ resolver: yupResolver(schema), defaultValues: defaults });
  const vatRegistered = useWatch({ control, name: 'vat_registered' });

  // Web shows these only when the *currently loaded* organization has the module.
  const hasProcurement = organizationHasSubscribed(MODULES.PROCUREMENT_AND_SUPPLY);
  const hasProjects = organizationHasSubscribed(MODULES.PROJECT_MANAGEMENT);

  const mutation = useMutation({
    mutationFn: async (values: Values) => {
      const payload = toPayload(values, organization);
      if (organization)
        return {
          kind: 'update' as const,
          data: await organizationsApi.update(organization.id, payload),
        };
      return { kind: 'create' as const, data: await organizationsApi.create(payload) };
    },
    onSuccess: async (result) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      if (result.kind === 'update') {
        queryClient.invalidateQueries({ queryKey: ['organizationDetails'] });
        // Settings such as defer_grn_billing change what the menu shows: refresh the session.
        await refreshAuth();
        setNotice(t.updateSuccess);
        onDone();
        return;
      }
      const created = result.data.newOrganization;
      // Like PUT …/load, creating returns a token scoped to the new organization.
      if (result.data.token && created?.organization?.id) {
        await adoptOrganization({
          token: result.data.token,
          authUser: result.data.authUser,
          authOrganization: created,
        });
      } else if (created?.organization?.id) {
        await loadOrganization(created.organization.id);
      }
      onDone();
    },
    onError: (error) => applyServerErrors(error, setError, FIELDS),
  });

  const submit = () => handleSubmit((values) => mutation.mutate(values))();
  const serverFieldError = useMemo(
    () => Object.values(errors).some((x) => x?.type === 'server'),
    [errors]
  );

  const CheckRow = ({
    name,
    label,
  }: {
    name:
      | 'vat_registered'
      | 'defer_grn_billing'
      | 'defer_project_certificate_invoicing'
      | 'generate_invoices_for_project_certificates';
    label: string;
  }) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <View style={styles.checkRow}>
          <Checkbox.Android
            status={value ? 'checked' : 'unchecked'}
            onPress={() => onChange(!value)}
          />
          <Text
            style={[styles.checkLabel, { color: palette.textPrimary }]}
            onPress={() => onChange(!value)}
          >
            {label}
          </Text>
        </View>
      )}
    />
  );

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: palette.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Section title={t.basicInfo} />
        <TextField
          control={control}
          name="name"
          label={t.name}
          icon="domain"
          placeholder={t.namePlaceholder}
        />
        <TextField
          control={control}
          name="email"
          label={t.email}
          icon="email-outline"
          placeholder={t.emailPlaceholder}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextField
          control={control}
          name="phone"
          label={t.phone}
          icon="phone-outline"
          placeholder={t.phonePlaceholder}
          keyboardType="phone-pad"
          autoComplete="tel"
        />
        <TextField
          control={control}
          name="website"
          label={t.website}
          icon="web"
          placeholder={t.websitePlaceholder}
          autoCapitalize="none"
          keyboardType="url"
        />
        <DateField control={control} name="recording_start_date" label={t.recordingStart} />
        <TextField
          control={control}
          name="tin"
          label={t.tin}
          icon="card-account-details-outline"
          placeholder={t.tinPlaceholder}
        />
        <SelectField
          control={control}
          name="country_code"
          label={t.country}
          icon="earth"
          options={countryOptions}
          // Web: choosing a country sets its currency.
          onSelect={(option) => {
            const country = COUNTRIES.find((c) => c.code === option.value);
            if (country) setValue('currency_code', country.currency.code, { shouldValidate: true });
          }}
        />
        <SelectField
          control={control}
          name="currency_code"
          label={t.currency}
          icon="cash"
          options={currencyOptions}
        />
        <TextField
          control={control}
          name="address"
          label={t.address}
          icon="map-marker-outline"
          placeholder={t.addressPlaceholder}
        />

        <Section title={t.vatSection} />
        <CheckRow name="vat_registered" label={t.vatRegistered} />
        {vatRegistered ? (
          <>
            <TextField
              control={control}
              name="vrn"
              label={t.vrn}
              icon="identifier"
              placeholder={t.vrnPlaceholder}
            />
            <TextField
              control={control}
              name="vat_percentage"
              label={t.vatPercentage}
              icon="percent-outline"
              placeholder={t.vatPercentagePlaceholder}
              keyboardType="decimal-pad"
            />
          </>
        ) : null}

        {hasProcurement || hasProjects ? <Section title={t.workflowSection} /> : null}
        {hasProcurement ? <CheckRow name="defer_grn_billing" label={t.deferGrnBilling} /> : null}
        {hasProjects ? (
          <CheckRow
            name="defer_project_certificate_invoicing"
            label={t.deferCertificateInvoicing}
          />
        ) : null}
        {hasProjects ? (
          <CheckRow
            name="generate_invoices_for_project_certificates"
            label={t.generateCertificateInvoices}
          />
        ) : null}

        <Section title={t.payrollSection} />
        <TextField
          control={control}
          name="standard_hours_per_month"
          label={t.standardHours}
          icon="clock-outline"
          keyboardType="decimal-pad"
          helper={t.standardHoursHelper}
        />
        <TextField
          control={control}
          name="employee_number_prefix"
          label={t.employeePrefix}
          icon="format-letter-case-upper"
          placeholder="e.g. PROS"
          autoCapitalize="characters"
          helper={t.employeePrefixHelper}
        />
        <TextField
          control={control}
          name="employee_number_padding"
          label={t.employeeDigits}
          icon="numeric"
          placeholder="e.g. 4"
          keyboardType="number-pad"
          helper={t.employeeDigitsHelper}
        />

        <Section title={t.brandingSection} />
        <ImageField
          control={control}
          name="logo"
          label={t.logo}
          helper={t.imageGuide}
          existingUrl={organization?.logo_path}
        />
        <ImageField
          control={control}
          name="organization_symbol"
          label={t.symbol}
          helper={t.imageGuide}
          existingUrl={organization?.settings?.symbol_path}
        />
        <ColorField control={control} name="main_color" label={t.mainColor} />
        <ColorField control={control} name="light_color" label={t.lightColor} />
        <ColorField control={control} name="dark_color" label={t.darkColor} />
        <ColorField
          control={control}
          name="contrast_text"
          label={t.contrastText}
          helper={t.colorGuide}
        />
        <TextField
          control={control}
          name="tagline"
          label={t.tagline}
          icon="format-quote-open"
          placeholder={t.taglinePlaceholder}
        />

        <FormMessage
          message={mutation.isError && !serverFieldError ? getErrorMessage(mutation.error) : null}
          type="error"
        />
        <GradientButton label={t.submit} onPress={submit} loading={mutation.isPending} />
      </ScrollView>
      <Snackbar visible={!!notice} onDismiss={() => setNotice(null)} duration={3000}>
        {notice}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

function Section({ title }: { title: string }) {
  const { palette } = useAppTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>{title}</Text>
      <Divider />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  section: { marginTop: 16, marginBottom: 12, gap: 6 },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 16 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  checkLabel: { flex: 1, paddingTop: 8, lineHeight: 20 },
});
