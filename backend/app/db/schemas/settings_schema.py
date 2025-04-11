from pydantic import BaseModel, model_validator
from typing import Optional, Self


class UserSettings(BaseModel):
    id: int
    user_id: int

    is_name_hidden: bool
    is_phone_hidden: bool
    is_email_hidden: bool
    is_picture_hidden: bool
    is_notification_allowed: bool
    is_local_notification: bool
    is_weekly_notification: bool
    is_onchange_notification: bool
    is_onreact_notification: bool


class UserSettingsRead(UserSettings): ...


class UserSettingsCreate(BaseModel):
    user_id: int
    is_name_hidden: bool = False
    is_phone_hidden: bool = True
    is_email_hidden: bool = False
    is_picture_hidden: bool = False
    is_notification_allowed: bool = True
    is_local_notification: bool = True
    is_weekly_notification: bool = False
    is_onchange_notification: bool = True
    is_onreact_notification: bool = True

    @model_validator(mode="after")
    def validate_notifications(self) -> Self:
        if not self.is_notification_allowed:
            self.is_local_notification = False
            self.is_weekly_notification = False
            self.is_onchange_notification = False
            self.is_onreact_notification = False
        return self


class UserSettingsUpdate(BaseModel):
    is_name_hidden: Optional[bool] = None
    is_phone_hidden: Optional[bool] = None
    is_email_hidden: Optional[bool] = None
    is_picture_hidden: Optional[bool] = None
    is_notification_allowed: Optional[bool] = None
    is_local_notification: Optional[bool] = None
    is_weekly_notification: Optional[bool] = None
    is_onchange_notification: Optional[bool] = None
    is_onreact_notification: Optional[bool] = None

    @model_validator(mode="after")
    def validate_notifications(self) -> Self:
        if self.is_notification_allowed is None:
            self.is_local_notification = None
            self.is_weekly_notification = None
            self.is_onchange_notification = None
            self.is_onreact_notification = None
        elif self.is_notification_allowed == False:
            self.is_local_notification = False
            self.is_weekly_notification = False
            self.is_onchange_notification = False
            self.is_onreact_notification = False
        return self
