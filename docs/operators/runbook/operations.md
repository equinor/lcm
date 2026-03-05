# Operations

> _Higher-level tasks associated with managing the system, and routine activities required to keep the system running smoothly._

## Change Management

> _Describe how changes to the system are managed, including approval workflows._

Changes are decided, designed, and developed by the team in agreement with the Business Solution Owner (BSO). After development and testing, changes are demonstrated to the BSO and deployed to production.

## Access Management

> _Adding or removing users. Managing permissions and access controls._

Any member within the All Equinor Users group has access to the application by default.

## Functional updates

> _Describe how functional updates are planned, developed, tested, and deployed._

Functional updates will usually happen when we decide to add or upgrade features and improvements from the business.

## Capacity management

> _Describe how system capacity is monitored and managed._

System capacity is monitored and managed using Radix built-in tools.

## Backup and restore

> _Provide overview of backup schedules, restoration steps, and responsible personnel._
Backups of Azure resources are handled by Azure's built-in backup solutions. For Azure Table Storage, point-in-time restore is enabled. For Azure Blob Storage, soft delete is enabled to protect against accidental deletions in addition to SharePoint being the source of truth for the data. In case of a need to restore data, the Azure portal can be used to access backup and restore options for the relevant resources.
