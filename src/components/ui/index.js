// UI Components Index
// Export all UI components for easy import

// Button Components
export {
  Button,
  PrimaryButton,
  SecondaryButton,
  GhostButton,
  DangerButton,
  IconButton,
  SaveButton,
  CancelButton,
  DeleteButton,
  EditButton,
  BackButton,
  NextButton,
  UploadButton,
  DownloadButton,
  AddButton
} from './Button';

// Input Components
import InputDefault from './Input';
export {
  TextInput,
  EmailInput,
  PhoneInput,
  PasswordInput,
  SelectInput,
  TextareaInput,
  DateInput
} from './Input';
export { InputDefault as Input };

// Modal Components
import ModalDefault from './Modal';
export {
  ModalHeader,
  ModalBody,
  ModalFooter,
  SmallModal,
  MediumModal,
  LargeModal,
  ExtraLargeModal,
  FullModal
} from './Modal';
export { ModalDefault as Modal };

// Card Components
import CardDefault from './Card';
export {
  CourseCard,
  StatsCard,
  BasicCard
} from './Card';
export { CardDefault as Card };

// Badge Components
import BadgeDefault from './Badge';
export {
  LevelBadge,
  StatusBadge,
  SuccessBadge,
  WarningBadge,
  ErrorBadge,
  InfoBadge,
  CountBadge,
  NewBadge,
  FeaturedBadge,
  PopularBadge
} from './Badge';
export { BadgeDefault as Badge };

// Alert Components
import AlertDefault from './Alert';
export {
  SuccessAlert,
  WarningAlert,
  ErrorAlert,
  InfoAlert,
  InlineAlert
} from './Alert';
export { AlertDefault as Alert };

// Loading Components
export {
  Loading,
  Spinner,
  DotsSpinner,
  PulseSpinner,
  BarSpinner,
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  SkeletonList,
  LoadingOverlay,
  InlineLoading,
  PageLoading,
  SmallSpinner,
  MediumSpinner,
  LargeSpinner,
  ExtraLargeSpinner
} from './Loading';

// Table Components
export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHeadCell,
  TableCell,
  Pagination,
  DataTable,
  StatusTableCell,
  ActionTableCell,
  CheckboxTableCell
} from './Table';

// File Upload Components
export {
  FileUpload,
  FileDropzone,
  FilePreview,
  FileList,
  ImageUpload,
  FileProgress
} from './FileUpload';

// Page Header Components
import PageHeaderDefault from './PageHeader';
export {
  PageTitle,
  PageActions,
  Breadcrumb,
} from './PageHeader';
export { PageHeaderDefault as PageHeader };

// Page Container Components
export {
  PageContainer,
  NarrowPageContainer,
  WidePageContainer,
  FullPageContainer,
  ContentContainer,
  PageContent,
  PageSection,
  PageGrid,
  PageSplit
} from './PageContainer';

// Section Components
export {
  Section,
  CollapsibleSection,
  CardSection,
  BorderedSection,
  InfoSection,
  WarningSection,
  SuccessSection,
  ErrorSection,
  SectionGroup,
  SectionTabs,
  SectionList,
  SectionGrid,
  SectionActions,
  SectionFooter,
  SectionEmpty
} from './Section';

// Grid/Flex Components
export {
  Grid,
  Flex,
  Stack,
  Spacer,
  Container,
  Row,
  Column,
  Center,
  Between,
  Grid2Cols,
  Grid3Cols,
  Grid4Cols,
  GridAuto,
  Wrap,
  VSpace,
  HSpace,
  FlexGrow,
  FlexShrink
} from './Grid';
