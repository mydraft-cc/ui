import { Button }       from './button';
import { ButtonBar }    from './button-bar';
import { Checkbox }     from './checkbox';
import { ComboBox }     from './combo-box';
import { Comment }      from './comment';
import { Dropdown }     from './dropdown';
import { Icon }         from './icon';
import { Image }        from './image';
import { Label }        from './label';
import { Link }         from './link';
import { Numeric }      from './numeric';
import { Paragraph }    from './paragraph';
import { Progress }     from './progress';
import { RadioButton }  from './radio-button';
import { Raster }       from './raster';
import { Shape }        from './shape';
import { Slider }       from './slider';
import { TextArea }     from './text-area';
import { TextInput }    from './text-input';
import { Toggle }       from './toggle';

import { RendererService } from '@app/wireframes/model/renderer.service';

export function registerRenderers(): RendererService {
    return new RendererService()
        .addRenderer(new Button())
        .addRenderer(new ButtonBar())
        .addRenderer(new Label())
        .addRenderer(new Checkbox())
        .addRenderer(new RadioButton())
        .addRenderer(new Numeric())
        .addRenderer(new Toggle())
        .addRenderer(new Image())
        .addRenderer(new Icon())
        .addRenderer(new Paragraph())
        .addRenderer(new Dropdown())
        .addRenderer(new ComboBox())
        .addRenderer(new Raster())
        .addRenderer(new Shape())
        .addRenderer(new Link())
        .addRenderer(new Progress())
        .addRenderer(new Slider())
        .addRenderer(new TextInput())
        .addRenderer(new TextArea())
        .addRenderer(new Comment());
}